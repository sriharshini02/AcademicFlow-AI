import express from "express";
import { getHODProfile, updateHODProfile } from "../controllers/hodSettings.controller.js";
import { verifyToken } from '../middleware/authJwt.js';

const router = express.Router();

router.get("/profile", verifyToken, getHODProfile);
router.put("/profile", verifyToken, updateHODProfile);

export default router;
