// routes/proctorRoutes.js
import express from "express";
import { getProctorProfile, updateProctorProfile } from "../controllers/proctor.controller.js";
import { getProctorDashboardData } from "../controllers/proctorDashboard.controller.js";
import { verifyToken } from "../middleware/authJwt.js";

const router = express.Router();

router.get("/profile", verifyToken, getProctorProfile);
router.put("/settings/update", verifyToken, updateProctorProfile);
router.get("/dashboard", verifyToken, getProctorDashboardData);

export default router;
