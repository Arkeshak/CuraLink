import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadReport,
  getMyReports,
  getReport,
  askReport,
  getReportHistory,
  deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Configure multer for report uploads (PDF/images up to 20MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/reports/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report_${req.user?.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed.'));
  },
});

router.get('/', protect, getMyReports);
router.post('/upload', protect, upload.single('report'), uploadReport);
router.get('/history', protect, getReportHistory);
router.get('/:id', protect, getReport);
router.post('/:id/ask', protect, askReport);
router.delete('/:id', protect, deleteReport);

export default router;
