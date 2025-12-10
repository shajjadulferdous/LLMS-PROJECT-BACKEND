import { Router } from "express";
import { jwtverifyJWT } from "../middlewares/auth.middlewares.js";
import { requireAdmin } from "../middlewares/admin.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { createCourse, listCourses, getCourse, updateCourse, deleteCourse, addMaterial, deleteMaterial, searchInstructors, submitQuizAnswer, uploadFile } from "../controllers/course.controller.js";
import { approveCourse, denyCourse, deleteAnyCourse, listPendingCourses } from "../controllers/admin.controller.js";

const router = Router();

// public
router.get("/", listCourses);
router.get("/:id", getCourse);

// instructor
router.post("/", jwtverifyJWT, createCourse);
router.patch("/:id", jwtverifyJWT, updateCourse);
router.delete("/:id", jwtverifyJWT, deleteCourse);
router.post("/:id/materials", jwtverifyJWT, addMaterial);
router.delete("/:id/materials/:materialId", jwtverifyJWT, deleteMaterial);
router.get("/search/instructors", jwtverifyJWT, searchInstructors);

// file upload
router.post("/upload", jwtverifyJWT, upload.single('file'), uploadFile);

// student - quiz submission
router.post("/:courseId/materials/:materialId/submit-quiz", jwtverifyJWT, submitQuizAnswer);

// admin
router.get("/admin/pending", jwtverifyJWT, requireAdmin, listPendingCourses);
router.post("/admin/:id/approve", jwtverifyJWT, requireAdmin, approveCourse);
router.post("/admin/:id/deny", jwtverifyJWT, requireAdmin, denyCourse);
router.delete("/admin/:id", jwtverifyJWT, requireAdmin, deleteAnyCourse);

export default router;
