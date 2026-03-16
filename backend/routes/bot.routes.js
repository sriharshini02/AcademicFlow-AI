import express from "express";
import { createVisitLog, getKioskHODStatus } from "../controllers/bot.controller.js";

const router = express.Router();

// POST request to receive data from the Raspberry Pi
router.post("/log-visit", createVisitLog);
router.get("/status", getKioskHODStatus);

export default router;