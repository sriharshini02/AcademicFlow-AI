import express from "express";
import { verifyToken } from "../middleware/authJwt.js";
import { 
  getProctorProfile,
  updateProctorProfile,
  getProctorStudents,
  getStudentDetails,
  addStudent,
  updateStudent,  addTask, toggleTask
} from "../controllers/proctor.controller.js";

// ❌ REMOVE THE IMPORT FROM 'proctorStudent.controller.js'
// (We deleted that line to fix your SyntaxError)
import { getProctorDashboardData } from "../controllers/proctorDashboard.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, getProctorProfile);
router.put("/settings/update", verifyToken, updateProctorProfile);
router.get("/dashboard", verifyToken, getProctorDashboardData);

router.get("/students", verifyToken, getProctorStudents);
router.post("/addstudent", verifyToken, addStudent);
router.put("/students/:id", verifyToken, updateStudent);
router.get("/students/:id", verifyToken, getStudentDetails);
router.post("/tasks", verifyToken, addTask);
router.patch("/tasks/:taskId", verifyToken, toggleTask);
export default router;