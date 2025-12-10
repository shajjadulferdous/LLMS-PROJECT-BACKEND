import { Router } from "express";
const router = Router();
import { upload } from '../middlewares/multer.middlewares.js'
import { logoutUser, RegisterUser, loginUser, UpdatePassword, refreshAccessToken, updateProfilePicture, updateProfile, me, forgotPassword, resetPassword, blockUser, unblockUser, approveInstructor, getAllUsers } from '../controllers/user.controller.js'
import { jwtverifyJWT } from "../middlewares/auth.middlewares.js";
import { requireAdmin } from "../middlewares/admin.middlewares.js";

router.route('/register').post(
    upload.fields(
        [{
            name: "profilePicture",
            maxCount: 1
        }]
    ),
    RegisterUser
)

router.route('/logout').post(jwtverifyJWT, logoutUser)

router.route('/login').post(loginUser)

router.route('/passwordchange').post(jwtverifyJWT, UpdatePassword)
router.route('/refresh').post(refreshAccessToken)
router.route('/me').get(jwtverifyJWT, me)
router.route('/profile').patch(jwtverifyJWT, updateProfile)
router.route('/profile/picture').post(jwtverifyJWT, upload.fields([{ name: 'profilePicture', maxCount: 1 }]), updateProfilePicture)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)

// admin actions
router.route('/admin/users').get(jwtverifyJWT, requireAdmin, getAllUsers)
router.route('/admin/users/:id/block').post(jwtverifyJWT, requireAdmin, blockUser)
router.route('/admin/users/:id/unblock').post(jwtverifyJWT, requireAdmin, unblockUser)
router.route('/admin/users/:id/approve-instructor').post(jwtverifyJWT, requireAdmin, approveInstructor)

export default router;