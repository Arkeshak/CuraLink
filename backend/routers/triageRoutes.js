import express from 'express';
import multer from 'multer';
import path from 'path';
import { triageScan, getTriageHistory } from '../controllers/triageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/triage/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `triage_${req.user?.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for triage.'));
  },
});

router.post('/scan', protect, upload.single('image'), triageScan);
router.get('/history', protect, getTriageHistory);

export default router;
