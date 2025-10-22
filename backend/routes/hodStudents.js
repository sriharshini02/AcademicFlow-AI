// routes/hodStudents.js
import express from "express";
import { getStudentsByDepartment, getStudentById,getHODStudents } from "../controllers/hodStudentsController.js";
import { verifyToken } from "../middleware/authJwt.js";

const router = express.Router();

router.get("/", verifyToken, getHODStudents);
router.get("/:studentId", verifyToken, getStudentById);

export default router;
