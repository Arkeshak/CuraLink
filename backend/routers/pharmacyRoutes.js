import express from 'express';
import {
  generateQRCode,
  redeemPrescription,
  listPharmacyPrescriptions,
  checkDrugs,
} from '../controllers/pharmacyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Generate QR token — doctor only
router.post('/prescriptions/:id/generate-qr', protect, authorizeRoles('doctor'), generateQRCode);

// Redeem prescription — pharmacy only
router.post('/redeem', protect, authorizeRoles('pharmacy', 'admin'), redeemPrescription);

// List prescriptions — pharmacy / admin
router.get('/prescriptions', protect, authorizeRoles('pharmacy', 'admin'), listPharmacyPrescriptions);

// Standalone drug interaction check — pharmacy, doctor, nurse, admin
router.post('/check-drugs', protect, authorizeRoles('pharmacy', 'doctor', 'nurse', 'admin'), checkDrugs);

export default router;

