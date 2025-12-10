import { Router } from "express";
import { jwtverifyJWT } from "../middlewares/auth.middlewares.js";
import { enrollInCourse, myEnrollments, checkEnrollment, updateProgress, completeCourse } from "../controllers/enroll.controller.js";

const router = Router();

router.post("/", jwtverifyJWT, enrollInCourse);
router.get("/me", jwtverifyJWT, myEnrollments);
router.get("/check/:courseId", jwtverifyJWT, checkEnrollment);
router.patch("/:enrollmentId/progress", jwtverifyJWT, updateProgress);
router.post("/:enrollmentId/complete", jwtverifyJWT, completeCourse);

export default router;
