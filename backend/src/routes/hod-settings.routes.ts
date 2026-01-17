import express from "express";
import { getHODProfile, updateHODProfile } from "../controllers/hod-settings.controller";
import { verifyToken } from '../middleware/jwt-auth';

const router = express.Router();

router.get("/profile", verifyToken, getHODProfile);
router.put("/profile", verifyToken, updateHODProfile);

export default router;
