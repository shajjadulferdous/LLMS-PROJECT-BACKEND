import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const approveCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
        id,
        { status: "approved" },
        { new: true, runValidators: true }
    ).populate("instructor", "username fullName email");

    if (!course) throw new ApiError(404, "Course not found");

    return res.status(200).json(new ApiResponse(200, course, "Course approved"));
});

export const denyCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");
    course.status = "denied";
    await course.save();
    return res.status(200).json(new ApiResponse(200, course, "Course denied"));
});

export const deleteAnyCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, "Course not found");
    await course.deleteOne();
    // remove from users' ownerCourse and enrollCourse
    await User.updateMany({}, { $pull: { ownerCourse: id, enrollCourse: id } });
    return res.status(200).json(new ApiResponse(200, null, "Course deleted by admin"));
});

export const listPendingCourses = asyncHandler(async (req, res) => {
    const pending = await Course.find({ status: "pending" }).populate("instructor", "username fullName");
    return res.status(200).json(new ApiResponse(200, pending));
});
