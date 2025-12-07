import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const RegisterUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password, education } = req.body;
    if (
        [username, email, fullName, password, education].some(filed => filed.trim() == "")
    ) {
        throw new ApiError(400, "Please fill all required fill")
    }
    const isExist = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (isExist) {
        throw new ApiError(401, "USERNAME OR EMAIL already registered")
    }
    let profilePictureUrl = "";

    // Support both single file (req.file) and field-based (req.files.profilePicture)
    const profilePicpath = req.file?.path || req.files?.profilePicture?.[0]?.path;
    console.log(profilePicpath)
    if (profilePicpath) {
        const uploadedUrl = await uploadOnCloudinary(profilePicpath);
        if (!uploadedUrl) {
            throw new ApiError(500, "Failed to upload profile picture")
        }
        profilePictureUrl = uploadedUrl;
    }

    const user = await User.create(
        {
            fullName,
            profilePicture: profilePictureUrl,
            username,
            password,
            email,
            education
        }
    )
    const isRegistered = await User.findById(user?._id).select(
        "-password -refreshToken"
    )
    if (!isRegistered) {
        throw new ApiError(400, "SOMETHING WENT WRONG WHEN REGISTERING");
    }
    return res.status(200).json(
        new ApiResponse(200, isRegistered, "Registration Successful")
    )
})

export {
    RegisterUser
}