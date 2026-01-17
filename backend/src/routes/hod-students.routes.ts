// routes/hodStudents.js
import express from "express";
import { getStudentById,getHODStudents, getHODStudentDetails } from "../controllers/hod-students.controller";
import { verifyToken } from "../middleware/jwt-auth";

const router = express.Router();

router.get("/", verifyToken, getHODStudents);
router.get("/:id", verifyToken, getHODStudentDetails);
router.get("/:studentId", verifyToken, getStudentById);
export default router;
