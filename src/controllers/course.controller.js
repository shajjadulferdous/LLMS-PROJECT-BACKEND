import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// creation charges a small fee; course starts as pending
export const createCourse = asyncHandler(async (req, res) => {
    const { title, description, price } = req.body;
    if (!title || !description || price == null) {
        throw new ApiError(400, "title, description, price are required");
    }
    const instructor = req.user?._id ? [req.user._id] : [];
    if (instructor.length === 0) {
        throw new ApiError(401, "Instructor authentication required");
    }
    // charge a small creation fee from creator's bank
    const creationFee = Math.max(1, Math.round(Number(price) * 0.05));
    try {
        const { Bank } = await import("../models/bank.model.js");
        const bank = await Bank.findOne({ user: req.user._id });
        if (!bank || bank.balance < creationFee) {
            throw new ApiError(400, "Insufficient funds for course creation fee");
        }
        bank.balance -= creationFee;
        bank.history.push(`COURSE_CREATE_FEE:${creationFee}`);
        await bank.save();
    } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(500, "Fee processing failed");
    }

    const course = await Course.create({ title, description, price, instructor, status: "pending" });
    // link course to creator's ownerCourse
    try {
        const { User } = await import("../models/user.model.js");
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { ownerCourse: course._id } });
    } catch { }
    return res.status(201).json(new ApiResponse(201, course, "Course created"));
});

export const listCourses = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
        q = "",
        minPrice,
        maxPrice,
        status,
        showAll, // New parameter for admin to see all courses
    } = req.query;

    const filter = {};
    if (q) filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
    ];
    if (minPrice != null || maxPrice != null) {
        filter.price = {};
        if (minPrice != null) filter.price.$gte = Number(minPrice);
        if (maxPrice != null) filter.price.$lte = Number(maxPrice);
    }

    // Status filtering logic
    if (status) {
        filter.status = status;
    }
    // If showAll=true is passed by admin, don't filter by status
    else if (showAll !== 'true') {
        // non-admins and requests without showAll see only approved courses
        if (!req.user || req.user.role !== "admin") {
            filter.status = "approved";
        }
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
        Course.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate("instructor", "username fullName profilePicture"),
        Course.countDocuments(filter),
    ]);

    return res.status(200).json(new ApiResponse(200, {
        items,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit) || 1),
    }));
});

export const getCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id).populate("instructor", "username fullName profilePicture");
    if (!course) throw new ApiError(404, "Course not found");

    // Check if course is approved
    if (course.status !== "approved") {
        const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user?._id?.toString());
        const isAdmin = req.user?.role === "admin";
        if (!isOwner && !isAdmin) throw new ApiError(403, "Course not approved yet");
    }

    // Check enrollment status for students
    let isEnrolled = false;
    let enrollmentRequired = false;

    if (req.user) {
        const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user._id.toString());
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin && req.user.role === "student") {
            // Check if student is enrolled
            const { Enroll } = await import("../models/enroll.model.js");
            const enrollment = await Enroll.findOne({
                course: course._id,
                student: req.user._id
            });

            isEnrolled = !!enrollment;
            enrollmentRequired = !isEnrolled;

            // If not enrolled, return course info without materials
            if (!isEnrolled) {
                const courseWithoutMaterials = {
                    _id: course._id,
                    title: course.title,
                    description: course.description,
                    price: course.price,
                    instructor: course.instructor,
                    status: course.status,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt,
                    materialsCount: course.materials.length,
                    enrollmentRequired: true,
                    isEnrolled: false
                };
                return res.status(200).json(new ApiResponse(200, courseWithoutMaterials));
            }
        }
    }

    // Return full course with materials if enrolled or instructor/admin
    const courseData = {
        ...course.toObject(),
        isEnrolled,
        enrollmentRequired: false
    };

    return res.status(200).json(new ApiResponse(200, courseData));
});

export const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, addInstructors, removeInstructors } = req.body;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");
    const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user?._id?.toString());
    if (!isOwner) throw new ApiError(403, "Only instructor can update");

    if (title) course.title = title;
    if (description) course.description = description;
    if (price != null) course.price = price;

    // Add new instructors
    if (addInstructors && Array.isArray(addInstructors)) {
        const { User } = await import("../models/user.model.js");
        for (const instructorId of addInstructors) {
            const instructor = await User.findById(instructorId);
            if (instructor && instructor.role === 'instructor' && !course.instructor.includes(instructorId)) {
                course.instructor.push(instructorId);
                // Add to instructor's ownerCourse
                await User.findByIdAndUpdate(instructorId, { $addToSet: { ownerCourse: course._id } });
            }
        }
    }

    // Remove instructors (but keep at least one)
    if (removeInstructors && Array.isArray(removeInstructors)) {
        if (course.instructor.length - removeInstructors.length < 1) {
            throw new ApiError(400, "Course must have at least one instructor");
        }
        const { User } = await import("../models/user.model.js");
        for (const instructorId of removeInstructors) {
            course.instructor = course.instructor.filter(i => i.toString() !== instructorId.toString());
            // Remove from instructor's ownerCourse
            await User.findByIdAndUpdate(instructorId, { $pull: { ownerCourse: course._id } });
        }
    }

    // updates reset to pending for re-approval
    course.status = "pending";
    await course.save();
    return res.status(200).json(new ApiResponse(200, course, "Course updated"));
});

export const deleteCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");
    const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user?._id?.toString());
    if (!isOwner) throw new ApiError(403, "Only instructor can delete");
    await course.deleteOne();
    // cleanup user course links
    try {
        const { User } = await import("../models/user.model.js");
        await User.updateMany({}, { $pull: { ownerCourse: id, enrollCourse: id } });
    } catch { }
    return res.status(200).json(new ApiResponse(200, null, "Course deleted"));
});

export const addMaterial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, type, url, videoFile, documentFile, duration, CoursePicture, quizQuestions } = req.body;

    if (!title || !type) {
        throw new ApiError(400, "Title and type are required");
    }

    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");

    const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user?._id?.toString());
    if (!isOwner) throw new ApiError(403, "Only instructor can add materials");

    // STRICT VALIDATION based on material type
    if (type === 'video') {
        // Video: ONLY accept video files (check file extension if uploaded)
        if (!videoFile && !url) {
            throw new ApiError(400, "Video file or video URL is required for video type");
        }
        if (videoFile && !videoFile.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
            throw new ApiError(400, "Only video files are allowed for video type");
        }
    }

    if (type === 'Document') {
        // Document: ONLY accept PDF files
        if (!documentFile && !url) {
            throw new ApiError(400, "PDF file or PDF URL is required for document type");
        }
        if (documentFile && !documentFile.match(/\.pdf$/i)) {
            throw new ApiError(400, "Only PDF files are allowed for document type");
        }
        if (url && !url.match(/\.pdf($|\?)/i)) {
            throw new ApiError(400, "Only PDF URLs are allowed for document type");
        }
    }

    if (type === 'link') {
        // Link: ONLY accept URL
        if (!url) {
            throw new ApiError(400, "URL is required for link type");
        }
        if (!url.match(/^https?:\/\//i)) {
            throw new ApiError(400, "Valid URL is required for link type");
        }
    }

    if (type === 'quiz') {
        // Quiz: EXACTLY ONE MCQ with 4 options
        if (!quizQuestions || !Array.isArray(quizQuestions)) {
            throw new ApiError(400, "Quiz questions array is required");
        }
        if (quizQuestions.length !== 1) {
            throw new ApiError(400, "Quiz must have exactly ONE question");
        }

        const q = quizQuestions[0];
        if (!q.question || !q.options || !Array.isArray(q.options)) {
            throw new ApiError(400, "Question and options are required");
        }
        if (q.options.length !== 4) {
            throw new ApiError(400, "Quiz must have exactly 4 options");
        }
        if (q.correctAnswer == null || q.correctAnswer < 0 || q.correctAnswer > 3) {
            throw new ApiError(400, "Correct answer must be between 0-3");
        }
        if (!q.options.every(opt => opt && opt.trim().length > 0)) {
            throw new ApiError(400, "All 4 options must be filled");
        }
    }

    const materialData = {
        title,
        type
    };

    // Add type-specific fields
    if (url) materialData.url = url;
    if (videoFile) materialData.videoFile = videoFile;
    if (documentFile) materialData.documentFile = documentFile;
    if (duration) materialData.duration = duration;
    if (CoursePicture) materialData.CoursePicture = CoursePicture;
    if (quizQuestions) materialData.quizQuestions = quizQuestions;

    course.materials.push(materialData);
    await course.save();
    return res.status(200).json(new ApiResponse(200, course, "Material added"));
});

export const deleteMaterial = asyncHandler(async (req, res) => {
    const { id, materialId } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");
    const isOwner = course.instructor.some((i) => (i._id ? i._id.toString() : i.toString()) === req.user?._id?.toString());
    if (!isOwner) throw new ApiError(403, "Only instructor can delete materials");
    course.materials = course.materials.filter(m => m._id.toString() !== materialId);
    await course.save();
    return res.status(200).json(new ApiResponse(200, course, "Material deleted"));
});

export const searchInstructors = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) throw new ApiError(400, "Search query required");
    const { User } = await import("../models/user.model.js");
    const instructors = await User.find({
        role: 'instructor',
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { fullName: { $regex: q, $options: 'i' } }
        ]
    }).select('username email fullName profilePicture').limit(10);
    return res.status(200).json(new ApiResponse(200, instructors));
});

// Submit quiz answer - gives instant +1 point for correct answer
export const submitQuizAnswer = asyncHandler(async (req, res) => {
    const { courseId, materialId } = req.params;
    const { selectedAnswer } = req.body;

    if (selectedAnswer == null || typeof selectedAnswer !== 'number') {
        throw new ApiError(400, "Selected answer (0-3) is required");
    }

    // Find course and material
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");

    // Check if student is enrolled
    const { Enroll } = await import("../models/enroll.model.js");
    const enrollment = await Enroll.findOne({
        course: courseId,
        student: req.user._id
    });

    if (!enrollment) {
        throw new ApiError(403, "You must be enrolled in this course to submit quizzes");
    }

    const material = course.materials.id(materialId);
    if (!material) throw new ApiError(404, "Material not found");
    if (material.type !== 'quiz') throw new ApiError(400, "Material is not a quiz");

    if (!material.quizQuestions || material.quizQuestions.length !== 1) {
        throw new ApiError(400, "Quiz must have exactly one question");
    }

    const question = material.quizQuestions[0];
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Check if already answered
    const existingScore = enrollment.quizScores.find(
        qs => qs.materialId.toString() === materialId
    );

    if (existingScore) {
        throw new ApiError(400, "You have already answered this quiz");
    }

    // Add score to enrollment
    enrollment.quizScores.push({
        materialId: materialId,
        score: isCorrect ? 1 : 0,
        answeredAt: new Date()
    });

    await enrollment.save();

    return res.status(200).json(new ApiResponse(200, {
        isCorrect,
        score: isCorrect ? 1 : 0,
        correctAnswer: question.correctAnswer,
        selectedAnswer,
        message: isCorrect ? "Correct! +1 point" : "Incorrect answer"
    }, isCorrect ? "Correct answer!" : "Incorrect answer"));
});

// Upload file (video/document) to Cloudinary
export const uploadFile = asyncHandler(async (req, res) => {
    console.log('Upload request received');
    console.log('File:', req.file);

    const file = req.file;
    if (!file) {
        console.error('No file in request');
        throw new ApiError(400, "No file uploaded");
    }

    // Upload to Cloudinary
    const { uploadOnCloudinary } = await import("../utils/cloudinary.js");
    const cloudinaryUrl = await uploadOnCloudinary(file.path);

    if (!cloudinaryUrl) {
        console.error('Cloudinary upload failed');
        throw new ApiError(500, "Failed to upload file to cloud storage");
    }

    console.log('File uploaded successfully to Cloudinary:', cloudinaryUrl);

    return res.status(200).json(new ApiResponse(200, {
        url: cloudinaryUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        cloudinaryUrl: cloudinaryUrl
    }, "File uploaded successfully"));
});

