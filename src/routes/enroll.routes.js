import { Router } from "express";
import { jwtverifyJWT } from "../middlewares/auth.middlewares.js";
import { enrollInCourse, myEnrollments, checkEnrollment, updateProgress, completeCourse, getPendingEnrollments, validateEnrollment } from "../controllers/enroll.controller.js";

const router = Router();

router.post("/", jwtverifyJWT, enrollInCourse);
router.get("/me", jwtverifyJWT, myEnrollments);
router.get("/check/:courseId", jwtverifyJWT, checkEnrollment);
router.patch("/:enrollmentId/progress", jwtverifyJWT, updateProgress);
router.post("/:enrollmentId/complete", jwtverifyJWT, completeCourse);

// Instructor validation routes
router.get("/pending", jwtverifyJWT, getPendingEnrollments);
router.post("/:enrollmentId/validate", jwtverifyJWT, validateEnrollment);

export default router;
