// routes/hodStudents.js
import express from "express";
import { getStudentsByDepartment, getStudentById,getHODStudents, getHODStudentDetails } from "../controllers/hodStudents.controller.js";
import { verifyToken } from "../middleware/authJwt.js";

const router = express.Router();

router.get("/", verifyToken, getHODStudents);
router.get("/:id", verifyToken, getHODStudentDetails);
router.get("/:studentId", verifyToken, getStudentById);
export default router;
