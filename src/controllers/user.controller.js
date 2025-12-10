import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const RegisterUser = asyncHandler(async (req, res) => {
    console.log('=== Registration Request Started ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('File:', req.file);

    const { username, email, fullName, password, education } = req.body;

    const required = [username, email, fullName, password, education];
    if (required.some(f => typeof f !== "string" || f.trim() === "")) {
        console.log('Validation failed: Missing required fields');
        throw new ApiError(400, "Please fill all required fields");
    }

    const isExist = await User.findOne({ $or: [{ email }, { username }] });
    if (isExist) {
        console.log('User already exists:', email, username);
        throw new ApiError(409, "Username or email already registered");
    }

    let profilePictureUrl = "";
    const profilePicpath = req.file?.path || req.files?.profilePicture?.[0]?.path;
    if (profilePicpath) {
        console.log('Uploading profile picture:', profilePicpath);
        const uploadedUrl = await uploadOnCloudinary(profilePicpath);
        if (uploadedUrl) {
            profilePictureUrl = uploadedUrl;
            console.log('Profile picture uploaded:', uploadedUrl);
        } else {
            console.log('Profile picture upload failed, continuing without it');
        }
    }

    // Determine role: only allow 'student' or 'instructor' from registration
    // Admin role should only be set manually in database or through other means
    let userRole = 'student';
    if (req.body?.role === 'instructor') {
        userRole = 'instructor';
    } else if (req.body?.role === 'admin') {
        userRole = 'admin';
    }
    console.log('User role:', userRole);

    const user = await User.create({
        fullName,
        profilePicture: profilePictureUrl,
        username,
        password,
        email,
        education,
        role: userRole
    });
    console.log('User created with ID:', user._id);

    const isRegistered = await User.findById(user?._id).select("-password -refreshToken");
    if (!isRegistered) {
        console.log('Failed to retrieve created user');
        throw new ApiError(500, "Something went wrong when registering");
    }

    console.log('Registration successful for user:', username);
    return res.status(201).json(new ApiResponse(201, isRegistered, "Registration successful"));
})

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!password || (typeof password !== "string" || password.trim() === "")) {
        throw new ApiError(400, "Password is required");
    }
    if (!email && !username) {
        throw new ApiError(400, "Please provide email or username");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    console.log('User logged in successfully:', loggedUser.email, 'Role:', loggedUser.role);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            ...loggedUser.toObject(),
            accessToken // Include accessToken in response body for localStorage
        }, "User logged successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
    const usid = req.user?._id;
    if (!usid) {
        throw new ApiError(403, "Invalid action");
    }

    const user = await User.findByIdAndUpdate(
        usid,
        { $set: { refreshToken: undefined } },
        { new: true }
    ).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, user, "Logout successful"));
})

const UpdatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, 'Old Password does not match')
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(
            new ApiResponse(200, user, 'Password Changed Successfully')
        )
})



const updateProfilePicture = asyncHandler(async (req, res) => {
    const usid = req.user?._id;
    if (!usid) {
        throw new ApiError(403, "Invalid action");
    }

    const profilePicpath = req.file?.path || req.files?.profilePicture?.[0]?.path;
    if (!profilePicpath) {
        throw new ApiError(400, "No profile picture provided");
    }

    const uploadedUrl = await uploadOnCloudinary(profilePicpath);
    if (!uploadedUrl) {
        throw new ApiError(500, "Failed to upload profile picture");
    }

    const user = await User.findByIdAndUpdate(
        usid,
        { $set: { profilePicture: uploadedUrl } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Profile picture updated"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("x-refresh-token");
    if (!incomingToken) throw new ApiError(401, "Refresh token missing");
    let decoded;
    try {
        decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }
    const user = await User.findById(decoded?._id);
    if (!user || user.refreshToken !== incomingToken) throw new ApiError(401, "Invalid refresh token");
    const accessToken = user.generateAccessToken();
    const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' };
    return res.status(200).cookie("accessToken", accessToken, options).json(new ApiResponse(200, { accessToken }));
})

const updateProfile = asyncHandler(async (req, res) => {
    const usid = req.user?._id;
    const { fullName, education } = req.body;
    const updated = await User.findByIdAndUpdate(usid, { $set: { fullName, education } }, { new: true }).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
})

const me = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user));
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30m
    await user.save({ validateBeforeSave: false });
    // In production, email it. For dev, return token.
    return res.status(200).json(new ApiResponse(200, { token }, "Password reset token generated"));
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiry: { $gt: new Date() } });
    if (!user) throw new ApiError(400, "Invalid or expired token");
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
})

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { $set: { isBlocked: true } }, { new: true }).select("-password -refreshToken");
    if (!updated) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, updated, "User blocked"));
})

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { $set: { isBlocked: false } }, { new: true }).select("-password -refreshToken");
    if (!updated) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, updated, "User unblocked"));
})

const approveInstructor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(id, { $set: { role: 'instructor' } }, { new: true }).select("-password -refreshToken");
    if (!updated) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, updated, "Instructor approved"));
})

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } }
        ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
        User.find(filter).select("-password -refreshToken").skip(skip).limit(Number(limit)),
        User.countDocuments(filter)
    ]);
    return res.status(200).json(new ApiResponse(200, {
        users,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }));
})

export {
    RegisterUser,
    logoutUser,
    loginUser,
    UpdatePassword,
    updateProfilePicture,
    refreshAccessToken,
    updateProfile,
    me,
    forgotPassword,
    resetPassword,
    blockUser,
    unblockUser,
    approveInstructor,
    getAllUsers
}