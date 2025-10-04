import express from 'express';
import { getAvailability, updateAvailability } from '../controllers/hodAvailability.controller.js';
import { verifyToken } from '../middleware/authJwt.js';

const router = express.Router();

// All routes now require token
router.get('/', verifyToken, getAvailability);
router.put('/', verifyToken, updateAvailability);

export default router;
