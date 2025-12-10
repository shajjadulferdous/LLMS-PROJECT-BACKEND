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
        throw new ApiError(400, "You are already enrolled in this course");
    }

    const bank = await Bank.findOne({ user: req.user._id });
    if (!bank) throw new ApiError(400, "No bank account linked");
    const ok = await bank.isPasswordCorrect(bankPassword || "");
    if (!ok) throw new ApiError(401, "Bank password incorrect");
    if (bank.balance < course.price) throw new ApiError(400, "Insufficient funds to enroll");
    bank.balance -= course.price;
    bank.history.push(`PURCHASE:${course._id}:${course.price}`);
    await bank.save();


    const enroll = await Enroll.create({ course: course._id, instructor: course.instructor, student: req.user._id });
    await Payment.create({ user: req.user._id, course: course._id, amount: course.price, method: "bank", status: "success", note: "Course enrollment" });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrollCourse: course._id } });

    return res.status(201).json(new ApiResponse(201, {
        enroll,
        isEnrolled: true,
        message: "Enrolled successfully! You now have access to all course materials."
    }, "Enrolled successfully"));
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

    return res.status(200).json(new ApiResponse(200, {
        isEnrolled: !!enrollment,
        enrollmentId: enrollment?._id || null
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
