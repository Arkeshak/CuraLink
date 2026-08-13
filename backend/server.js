import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import fs from 'fs';
import authRoutes from './routers/authRoutes.js';
import patientRoutes from './routers/patientRoutes.js';
import doctorRoutes from './routers/doctorRoutes.js';
import nurseRoutes from './routers/nurseRoutes.js';
import adminRoutes from './routers/adminRoutes.js';
import appointmentRoutes from './routers/appointmentRoutes.js';
import messageRoutes from './routers/messageRoutes.js';
import aiRoutes from './routers/aiRoutes.js';
import prescriptionRoutes from './routers/prescriptionRoutes.js';
import labRoutes from './routers/labRoutes.js';
import medicalRecordRoutes from './routers/medicalRecordRoutes.js';
import notificationRoutes from './routers/notificationRoutes.js';
import reportRoutes from './routers/reportRoutes.js';
import triageRoutes from './routers/triageRoutes.js';
import pharmacyRoutes from './routers/pharmacyRoutes.js';
import Lab from './model/Lab.js';

// 1. Load environment variables FIRST
dotenv.config();

// 2. Connect to Database AFTER env is loaded
connectDB();

// Clean up old/mock labs that don't have a valid approved nurse
const cleanUpLabs = async () => {
  try {
    await Lab.deleteMany({
      $or: [
        { assignedNurse: { $exists: false } },
        { assignedNurse: null },
      ],
    });
    const labs = await Lab.find().populate('assignedNurse');
    for (const lab of labs) {
      if (!lab.assignedNurse || lab.assignedNurse.role !== 'nurse') {
        await Lab.deleteOne({ _id: lab._id });
      }
    }
    console.log('[CleanUp] Laboratory database successfully cleaned of mock data.');
  } catch (err) {
    console.error('[CleanUp] Error cleaning up labs:', err);
  }
};
setTimeout(cleanUpLabs, 3000);

const app = express();

// ── CORS — allow Next.js web-app and local dev ────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.WEB_APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Ensure upload directories exist ──────────────────────────────────────────
['uploads', 'uploads/reports', 'uploads/triage'].forEach((dir) => {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Route Mounts ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/notifications', notificationRoutes);
// ── CuraLink AI & Platform Routes ────────────────────────────────────────────
app.use('/api/reports', reportRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// Health / root
app.get('/', (req, res) => {
  res.json({ name: 'CuraLink API', version: '1.0.0', status: 'running' });
});

// Global JSON error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CuraLink API running on port ${PORT}`);
});
