import { Course } from "../models/course.model.js";
import { Enroll } from "../models/enroll.model.js";
import { Bank } from "../models/bank.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/payment.model.js";

export const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId, bankPassword } = req.body;
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");

    // Check if already enrolled
    const existingEnrollment = await Enroll.findOne({
        course: courseId,
        student: req.user._id
    });

    if (existingEnrollment) {
        if (existingEnrollment.paymentStatus === 'pending') {
            throw new ApiError(400, "Your enrollment is pending instructor validation");
        }
        throw new ApiError(400, "You are already enrolled in this course");
    }

    const bank = await Bank.findOne({ user: req.user._id });
    if (!bank) throw new ApiError(400, "No bank account linked");
    const ok = await bank.isPasswordCorrect(bankPassword || "");
    if (!ok) throw new ApiError(401, "Bank password incorrect");
    if (bank.balance < course.price) throw new ApiError(400, "Insufficient funds to enroll");

    // Deduct from student's account
    bank.balance -= course.price;
    bank.history.push(`PENDING_ENROLLMENT:${course._id}:${course.price}:${new Date().toISOString()}`);
    await bank.save();

    // Create pending enrollment (waiting for instructor validation)
    const enroll = await Enroll.create({
        course: course._id,
        instructor: course.instructor,
        student: req.user._id,
        transactionAmount: course.price,
        paymentStatus: 'pending'
    });

    await Payment.create({
        user: req.user._id,
        course: course._id,
        amount: course.price,
        method: "bank",
        status: "success",
        note: "Course enrollment - pending instructor validation"
    });

    return res.status(201).json(new ApiResponse(201, {
        enroll,
        isEnrolled: false,
        paymentStatus: 'pending',
        message: "Payment successful! Waiting for instructor to validate your enrollment."
    }, "Enrollment request submitted"));
});

export const myEnrollments = asyncHandler(async (req, res) => {
    // Fetch actual enrollment records, not just courses from user.enrollCourse
    const enrollments = await Enroll.find({ student: req.user._id })
        .populate('course')
        .populate('instructor', 'username fullName profilePicture')
        .sort({ createdAt: -1 });

    // Transform to include progress, status, and other enrollment info
    const enrichedEnrollments = enrollments.map(enrollment => {
        const course = enrollment.course;
        const totalMaterials = course?.materials?.length || 0;
        const completedMaterials = enrollment.completedMaterials?.length || 0;
        const progress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

        return {
            _id: enrollment._id,
            course: enrollment.course,
            student: enrollment.student,
            instructor: enrollment.instructor,
            quizScores: enrollment.quizScores,
            createdAt: enrollment.createdAt,
            updatedAt: enrollment.updatedAt,
            status: enrollment.status,
            progress: progress,
            completedMaterials: enrollment.completedMaterials || [],
            certificateIssued: enrollment.status === 'completed'
        };
    });

    return res.status(200).json(new ApiResponse(200, enrichedEnrollments));
});

export const checkEnrollment = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const enrollment = await Enroll.findOne({
        course: courseId,
        student: req.user._id
    });

    // Consider enrolled if payment is validated OR if paymentStatus doesn't exist (legacy enrollments)
    const isEnrolled = enrollment && (
        enrollment.paymentStatus === 'validated' ||
        !enrollment.paymentStatus ||
        enrollment.paymentStatus === null
    );

    return res.status(200).json(new ApiResponse(200, {
        isEnrolled: isEnrolled,
        enrollmentId: enrollment?._id || null,
        paymentStatus: enrollment?.paymentStatus || null,
        isPending: enrollment?.paymentStatus === 'pending'
    }));
});

export const updateProgress = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const { completedMaterial } = req.body;

    const enrollment = await Enroll.findById(enrollmentId).populate('course');
    if (!enrollment) throw new ApiError(404, "Enrollment not found");

    // Verify the student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this enrollment");
    }

    // Add material to completedMaterials if not already there
    if (!enrollment.completedMaterials.includes(completedMaterial)) {
        enrollment.completedMaterials.push(completedMaterial);
        await enrollment.save();
    }

    // Calculate progress
    const totalMaterials = enrollment.course.materials?.length || 0;
    const completedCount = enrollment.completedMaterials.length;
    const progress = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    // Auto-complete if all materials are done
    if (completedCount === totalMaterials && totalMaterials > 0) {
        enrollment.status = 'completed';
        await enrollment.save();
    }

    return res.status(200).json(new ApiResponse(200, {
        enrollment,
        progress,
        completedMaterials: enrollment.completedMaterials
    }, "Progress updated successfully"));
});

export const completeCourse = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;

    const enrollment = await Enroll.findById(enrollmentId);
    if (!enrollment) throw new ApiError(404, "Enrollment not found");

    // Verify the student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to complete this enrollment");
    }

    enrollment.status = 'completed';
    await enrollment.save();

    return res.status(200).json(new ApiResponse(200, enrollment, "Course completed successfully! Congratulations!"));
});

// Get pending enrollments for instructor
export const getPendingEnrollments = asyncHandler(async (req, res) => {
    // Get courses where the current user is an instructor
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);

    // Find pending enrollments for these courses
    const pendingEnrollments = await Enroll.find({
        course: { $in: courseIds },
        paymentStatus: 'pending'
    })
        .populate('course', 'title price')
        .populate('student', 'username fullName email profilePicture')
        .sort({ createdAt: -1 });

    // Get bank account information for each student
    const enrollmentsWithBankInfo = await Promise.all(
        pendingEnrollments.map(async (enrollment) => {
            const bank = await Bank.findOne({ user: enrollment.student._id });
            return {
                ...enrollment.toObject(),
                studentBankAccount: bank?.accountNo || 'N/A'
            };
        })
    );

    return res.status(200).json(new ApiResponse(200, enrollmentsWithBankInfo, "Pending enrollments retrieved"));
});

// Validate enrollment (instructor only)
export const validateEnrollment = asyncHandler(async (req, res) => {
    const { enrollmentId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const enrollment = await Enroll.findById(enrollmentId).populate('course').populate('student');
    if (!enrollment) throw new ApiError(404, "Enrollment not found");

    // Verify instructor owns this course
    const isInstructor = enrollment.instructor.some(
        instId => instId.toString() === req.user._id.toString()
    );
    if (!isInstructor) {
        throw new ApiError(403, "Only course instructors can validate enrollments");
    }

    if (enrollment.paymentStatus !== 'pending') {
        throw new ApiError(400, `Enrollment is already ${enrollment.paymentStatus}`);
    }

    if (action === 'approve') {
        // Transfer money to instructor's bank account
        const instructorBank = await Bank.findOne({ user: req.user._id });
        if (!instructorBank) throw new ApiError(400, "Instructor bank account not found");

        instructorBank.balance += enrollment.transactionAmount;
        instructorBank.history.push(
            `ENROLLMENT_VALIDATED:${enrollment.course._id}:${enrollment.transactionAmount}:${enrollment.student._id}:${new Date().toISOString()}`
        );
        await instructorBank.save();

        // Update enrollment status
        enrollment.paymentStatus = 'validated';
        enrollment.validatedBy = req.user._id;
        enrollment.validatedAt = new Date();
        await enrollment.save();

        // Add course to student's enrollCourse array
        await User.findByIdAndUpdate(enrollment.student._id, {
            $addToSet: { enrollCourse: enrollment.course._id }
        });

        // Update student's bank history
        const studentBank = await Bank.findOne({ user: enrollment.student._id });
        if (studentBank) {
            studentBank.history.push(
                `ENROLLMENT_APPROVED:${enrollment.course._id}:${enrollment.transactionAmount}:${new Date().toISOString()}`
            );
            await studentBank.save();
        }

        return res.status(200).json(new ApiResponse(200, enrollment, "Enrollment validated successfully. Student now has access to the course."));
    }
    else if (action === 'reject') {
        // Refund money to student
        const studentBank = await Bank.findOne({ user: enrollment.student._id });
        if (!studentBank) throw new ApiError(400, "Student bank account not found");

        studentBank.balance += enrollment.transactionAmount;
        studentBank.history.push(
            `REFUND:${enrollment.course._id}:${enrollment.transactionAmount}:${new Date().toISOString()}`
        );
        await studentBank.save();

        // Update enrollment status
        enrollment.paymentStatus = 'rejected';
        enrollment.validatedBy = req.user._id;
        enrollment.validatedAt = new Date();
        await enrollment.save();

        return res.status(200).json(new ApiResponse(200, enrollment, "Enrollment rejected. Amount refunded to student."));
    }
    else {
        throw new ApiError(400, "Invalid action. Use 'approve' or 'reject'");
    }
});
