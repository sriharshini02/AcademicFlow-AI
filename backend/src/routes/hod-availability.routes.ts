import express from 'express';
import { getAvailability, updateAvailability } from '../controllers/hod-availability.controller';
import { verifyToken } from '../middleware/jwt-auth';

const router = express.Router();

// All routes now require token
router.get('/', verifyToken, getAvailability);
router.put('/', verifyToken, updateAvailability);

export default router;
