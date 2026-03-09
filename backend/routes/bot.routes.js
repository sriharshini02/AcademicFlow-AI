import express from "express";
import { createVisitLog } from "../controllers/bot.controller.js";

const router = express.Router();

// POST request to receive data from the Raspberry Pi
router.post("/log-visit", createVisitLog);

export default router;