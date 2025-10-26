// routes/proctorRoutes.js
import express from "express";
import { getProctorProfile, updateProctorProfile, getProctorStudents } from "../controllers/proctor.controller.js";
import { getProctorDashboardData } from "../controllers/proctorDashboard.controller.js";
import { verifyToken } from "../middleware/authJwt.js";
import { addStudent, updateStudent, getStudentDetails } from "../controllers/proctorStudent.controller.js";
const router = express.Router();

router.get("/profile", verifyToken, getProctorProfile);
router.put("/settings/update", verifyToken, updateProctorProfile);
router.get("/dashboard", verifyToken, getProctorDashboardData);
// GET all students assigned to a proctor
router.get("/students", verifyToken, getProctorStudents);

// POST new student core + personal info
router.post("/addstudent", verifyToken, addStudent);

// PUT update any student info
router.put("/students/:id", verifyToken, updateStudent);

// GET full student details with all associations
router.get("/students/:id", verifyToken, getStudentDetails);

export default router;
