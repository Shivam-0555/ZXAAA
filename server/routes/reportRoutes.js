import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, getReports);
router.put('/:id', protect, updateReportStatus);

export default router;
