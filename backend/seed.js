import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import Models
import User from './model/User.js';
import Appointment from './model/Appointment.js';
import Prescription from './model/Prescription.js';
import Report from './model/Report.js';
import TriageScan from './model/TriageScan.js';
import AIAnalysisLog from './model/AIAnalysisLog.js';
import RAGQuery from './model/RAGQuery.js';
import LabBooking from './model/LabBooking.js';
import MedicalRecord from './model/MedicalRecord.js';
import OTP from './model/OTP.js';
import Lab from './model/Lab.js';
import LabSchedule from './model/LabSchedule.js';
import LabCategory from './model/LabCategory.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/curalink';

// Helper to hash passwords quickly
const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pwd, salt);
};

const runSeeder = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // 1. Clear existing database collections
    console.log('🧹 Clearing existing data...');
    await User.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await Report.deleteMany();
    await TriageScan.deleteMany();
    await AIAnalysisLog.deleteMany();
    await RAGQuery.deleteMany();
    await LabBooking.deleteMany();
    await MedicalRecord.deleteMany();
    await OTP.deleteMany();
    await Lab.deleteMany();
    await LabSchedule.deleteMany();
    await LabCategory.deleteMany();
    console.log('✅ Cleared.');

    const defaultPassword = 'Password@123';
    // Mongoose hooks will hash the password on create, so we can just pass the raw password

    // ==========================================
    // 2. DOCTORS (5)
    // ==========================================
    console.log('👨‍⚕️ Creating Doctors...');
    const doctorData = [
      { name: 'Dr. Ramesh Perera', email: 'ramesh.perera@curalink.com', phone: '0711111111', role: 'doctor', status: 'approved', specialization: 'General Physician', experienceYears: '15', consultationFee: 1500, photo: '/images/doctors/doc1.jpg', hospital: 'CuraLink General' },
      { name: 'Dr. Nimali Silva', email: 'nimali.silva@curalink.com', phone: '0711111112', role: 'doctor', status: 'approved', specialization: 'Cardiologist', experienceYears: '20', consultationFee: 2500, photo: '/images/doctors/doc2.jpg', hospital: 'CuraLink Heart Center' },
      { name: 'Dr. Sunil Jayawardena', email: 'sunil.jay@curalink.com', phone: '0711111113', role: 'doctor', status: 'approved', specialization: 'Pediatrician', experienceYears: '12', consultationFee: 2000, photo: '/images/doctors/doc3.jpg', hospital: 'CuraLink Kids' },
      { name: 'Dr. Amara Fernando', email: 'amara.fernando@curalink.com', phone: '0711111114', role: 'doctor', status: 'approved', specialization: 'Dermatologist', experienceYears: '8', consultationFee: 1800, photo: '/images/doctors/doc4.jpg', hospital: 'CuraLink Skin Clinic' },
      { name: 'Dr. Kamal Wickramasinghe', email: 'kamal.wick@curalink.com', phone: '0711111115', role: 'doctor', status: 'approved', specialization: 'ENT Specialist', experienceYears: '18', consultationFee: 2200, photo: '/images/doctors/doc5.jpg', hospital: 'CuraLink ENT' },
    ];
    const docs = [];
    for (const d of doctorData) {
      docs.push(await User.create({ ...d, password: defaultPassword }));
    }
    const [drGeneral, drCardio, drPediatrician, drDermatologist, drENT] = docs;

    // ==========================================
    // 3. PATIENTS (5)
    // ==========================================
    console.log('🤒 Creating Patients...');
    const patientData = [
      { name: 'Sanduni Rathnayake', email: 'sanduni@example.com', phone: '0772222221', role: 'patient', status: 'approved', gender: 'Female', bloodGroup: 'O+', allergies: ['Penicillin'], chronicConditions: ['Hypertension'] },
      { name: 'Kasun de Silva', email: 'kasun@example.com', phone: '0772222222', role: 'patient', status: 'approved', gender: 'Male', bloodGroup: 'A+', allergies: ['Dust'], chronicConditions: [] },
      { name: 'Chamari Liyanage', email: 'chamari@example.com', phone: '0772222223', role: 'patient', status: 'approved', gender: 'Female', bloodGroup: 'B-', allergies: ['Peanuts', 'Aspirin'], chronicConditions: ['Asthma'] },
      { name: 'Nuwan Bandara', email: 'nuwan@example.com', phone: '0772222224', role: 'patient', status: 'approved', gender: 'Male', bloodGroup: 'AB+', allergies: [], chronicConditions: ['Type 2 Diabetes'] },
      { name: 'Dinithi Peiris', email: 'dinithi@example.com', phone: '0772222225', role: 'patient', status: 'approved', gender: 'Female', bloodGroup: 'O-', allergies: [], chronicConditions: [] },
    ];
    const pats = [];
    for (const p of patientData) {
      pats.push(await User.create({ ...p, password: defaultPassword }));
    }
    const [patSanduni, patKasun, patChamari, patNuwan, patDinithi] = pats;

    // ==========================================
    // 4. NURSES & LABS (5)
    // ==========================================
    console.log('💉 Creating Nurses & Labs...');
    const labCategories = await LabCategory.insertMany([
      { name: 'OPD', description: 'Outpatient Department Lab' },
      { name: 'ICU', description: 'Intensive Care Unit Lab' },
      { name: 'General', description: 'General Testing Lab' },
    ]);
    
    const nurseData = [
      { name: 'Nurse Anoja', email: 'anoja@curalink.com', phone: '0723333331', role: 'nurse', status: 'approved', department: 'OPD' },
      { name: 'Nurse Dilrukshi', email: 'dilrukshi@curalink.com', phone: '0723333332', role: 'nurse', status: 'approved', department: 'ICU' },
      { name: 'Nurse Roshan', email: 'roshan@curalink.com', phone: '0723333333', role: 'nurse', status: 'approved', department: 'General' },
      { name: 'Nurse Piyumi', email: 'piyumi@curalink.com', phone: '0723333334', role: 'nurse', status: 'approved', department: 'OPD' },
      { name: 'Nurse Kanthi', email: 'kanthi@curalink.com', phone: '0723333335', role: 'nurse', status: 'approved', department: 'General' },
    ];
    const nurses = [];
    const labs = [];
    for (let i = 0; i < nurseData.length; i++) {
      const n = await User.create({ ...nurseData[i], password: defaultPassword });
      nurses.push(n);
      // Create a lab for each nurse
      const cat = labCategories.find(c => c.name === n.department) || labCategories[2];
      const l = await Lab.create({
        name: `${n.department} Lab - ${n.name}`,
        floor: 'Ground Floor',
        status: 'Available',
        assignedNurse: n._id,
        category: cat._id
      });
      labs.push(l);
    }
    const [nurseAnoja] = nurses;
    const [labOPD] = labs;

    // ==========================================
    // 5. ADMINS & PHARMACIES
    // ==========================================
    console.log('🛡️ Creating Admins & Pharmacies...');
    await User.create({ name: 'Admin One', email: 'admin@curalink.com', role: 'admin', status: 'approved', password: defaultPassword });
    await User.create({ name: 'Admin Two', email: 'admin2@curalink.com', role: 'admin', status: 'approved', password: defaultPassword });
    
    const pharmacy1 = await User.create({ name: 'City Pharmacy', email: 'pharmacy@curalink.com', role: 'pharmacy', status: 'approved', password: defaultPassword });
    await User.create({ name: 'HealthPlus Pharmacy', email: 'pharmacy2@curalink.com', role: 'pharmacy', status: 'approved', password: defaultPassword });

    // ==========================================
    // 6. APPOINTMENTS (Past & Upcoming)
    // ==========================================
    console.log('📅 Scheduling Appointments...');
    const now = new Date();
    const pastDate = new Date(now); pastDate.setDate(pastDate.getDate() - 3);
    const futureDate = new Date(now); futureDate.setDate(futureDate.getDate() + 2);

    const appointments = await Appointment.insertMany([
      // Sanduni: Past General, Upcoming Cardio
      { patient: patSanduni._id, doctor: drGeneral._id, date: pastDate, timeSlot: '09:00 AM', queueNumber: 1, status: 'completed', symptoms: 'Fever and chills' },
      { patient: patSanduni._id, doctor: drCardio._id, date: futureDate, timeSlot: '10:30 AM', queueNumber: 5, status: 'confirmed', symptoms: 'Occasional chest tightness' },
      
      // Kasun: Past ENT
      { patient: patKasun._id, doctor: drENT._id, date: pastDate, timeSlot: '11:00 AM', queueNumber: 12, status: 'completed', symptoms: 'Earache and blocked nose' },
      
      // Chamari: Past Cardio (will get interacting drug), Upcoming Derm
      { patient: patChamari._id, doctor: drCardio._id, date: pastDate, timeSlot: '08:30 AM', queueNumber: 2, status: 'completed', symptoms: 'Palpitations' },
      { patient: patChamari._id, doctor: drDermatologist._id, date: futureDate, timeSlot: '04:00 PM', queueNumber: 8, status: 'pending', symptoms: 'Skin rash on arm' },
      
      // Nuwan: Upcoming Pediatrician (for child)
      { patient: patNuwan._id, doctor: drPediatrician._id, date: futureDate, timeSlot: '09:30 AM', queueNumber: 4, status: 'confirmed', symptoms: 'Child has persistent cough' },
      
      // Dinithi: Past Derm
      { patient: patDinithi._id, doctor: drDermatologist._id, date: pastDate, timeSlot: '05:00 PM', queueNumber: 15, status: 'completed', symptoms: 'Severe acne breakout' }
    ]);

    const [sanduniPast, sanduniFut, kasunPast, chamariPast, chamariFut, nuwanFut, dinithiPast] = appointments;

    // ==========================================
    // 7. PRESCRIPTIONS & DRUG INTERACTION
    // ==========================================
    console.log('💊 Writing Prescriptions...');
    // Normal Prescription (Sanduni)
    await Prescription.create({
      patient: patSanduni._id,
      doctor: drGeneral._id,
      appointment: sanduniPast._id,
      medicines: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'TDS (Three times a day)', duration: '3 Days', notes: 'Take after meals' },
        { name: 'Vitamin C', dosage: '1000mg', frequency: 'OD (Once a day)', duration: '5 Days' }
      ],
      instructions: 'Drink plenty of water and rest.',
      diagnosisNote: 'Viral fever',
      qrToken: 'QR-SANDUNI-1234',
      status: 'issued'
    });

    // Drug Interaction Prescription (Chamari - Asthma & Aspirin Allergy)
    await Prescription.create({
      patient: patChamari._id,
      doctor: drCardio._id,
      appointment: chamariPast._id,
      medicines: [
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'ON (Once at night)', duration: '30 Days' },
        { name: 'Aspirin', dosage: '75mg', frequency: 'OD (Once a day)', duration: '30 Days', notes: 'Blood thinner' } // Danger: Chamari has Aspirin allergy!
      ],
      instructions: 'Monitor blood pressure daily.',
      diagnosisNote: 'Mild hypertension and risk of clots',
      qrToken: 'QR-CHAMARI-DANGER',
      status: 'issued',
      interactionWarnings: ['SEVERE: Patient has a recorded allergy to Aspirin!', 'WARNING: Aspirin can exacerbate Asthma symptoms.']
    });

    // Redeemed Prescription (Dinithi)
    await Prescription.create({
      patient: patDinithi._id,
      doctor: drDermatologist._id,
      appointment: dinithiPast._id,
      medicines: [
        { name: 'Isotretinoin', dosage: '20mg', frequency: 'OD', duration: '30 Days' },
        { name: 'Erythromycin Gel', dosage: '2%', frequency: 'BD (Twice a day)', duration: '14 Days' }
      ],
      instructions: 'Apply gel only on affected areas. Avoid sun exposure.',
      diagnosisNote: 'Acne Vulgaris',
      qrToken: 'QR-DINITHI-REDEEMED',
      status: 'redeemed',
      redeemed: true,
      redeemedAt: new Date(),
      redeemedBy: pharmacy1._id
    });

    // ==========================================
    // 8. AI ANALYSIS & TRIAGE SCANS
    // ==========================================
    console.log('🤖 Simulating AI Analysis & Triage...');
    await AIAnalysisLog.create({
      patient: patSanduni._id,
      symptomsProvided: 'I have had a tight chest and shortness of breath for the last 2 days. It gets worse when I climb stairs.',
      aiResponse: 'Based on your symptoms (tight chest, shortness of breath, exertional worsening), this could be related to a cardiac or respiratory issue. Given the chest tightness, it is important to rule out heart-related conditions.',
      predictedConditions: ['Angina Pectoris', 'Asthma', 'Coronary Artery Disease'],
      recommendedSpecialist: 'Cardiologist' // Matches Dr. Nimali Silva
    });

    await TriageScan.create({
      patient: patKasun._id,
      imageUrl: 'https://images.unsplash.com/photo-1600180758890-a7d1aa1573ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // placeholder wound image
      modelResult: 'Analysis shows a localized erythematous region with slight swelling, characteristic of a minor superficial skin infection or allergic dermatitis. No deep tissue necrosis or severe blistering observed.',
      urgencyFlag: 'See Doctor Soon',
      urgencyScore: 0.65,
      observations: ['Erythema (Redness)', 'Mild Edema (Swelling)', 'Superficial'],
      recommendedSpecialist: 'Dermatologist'
    });

    // ==========================================
    // 9. LAB REPORTS & RAG QUERIES
    // ==========================================
    console.log('📄 Uploading Reports & RAG Queries...');
    const report1 = await Report.create({
      patient: patNuwan._id,
      fileName: 'Complete_Blood_Count_Nuwan.pdf',
      fileUrl: '/uploads/cbc_nuwan.pdf',
      ocrText: 'COMPLETE BLOOD COUNT (CBC) \n Hemoglobin: 11.2 g/dL (Low) \n WBC: 8,500 /cumm (Normal) \n Platelets: 210,000 /cumm (Normal)',
      chunks: [
        { text: 'Hemoglobin: 11.2 g/dL (Low)', embedding: Array.from({length: 1536}, () => Math.random()), startChar: 30, endChar: 57 }
      ],
      status: 'ready'
    });

    await RAGQuery.create({
      patient: patNuwan._id,
      report: report1._id,
      question: 'Is my Hemoglobin level normal?',
      answer: 'Based on your Complete Blood Count report, your Hemoglobin level is 11.2 g/dL, which is marked as "Low". You should discuss this with your physician to see if you need iron supplements.',
      retrievedChunks: [
        { reportId: report1._id, reportName: report1.fileName, text: 'Hemoglobin: 11.2 g/dL (Low)', score: 0.92 }
      ]
    });

    // ==========================================
    // 10. LAB BOOKINGS
    // ==========================================
    console.log('🧪 Creating Lab Bookings...');
    // Create a schedule for LabOPD
    const schedule = await LabSchedule.create({
      lab: labOPD._id,
      date: new Date(),
      startTime: '08:00 AM',
      endTime: '04:00 PM',
      maxPatients: 50
    });

    await LabBooking.create({
      bookingRef: 'LAB-OPD-778899',
      lab: labOPD._id,
      scheduleSlot: schedule._id,
      patientUser: patKasun._id,
      appointmentDate: new Date(),
      patient: {
        fullName: patKasun.name,
        nic: '951234567V',
        gender: 'Male',
        mobile: patKasun.phone
      },
      collectionMethod: 'Hospital',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      queueToken: 12,
      status: 'Sample-Collected',
      checkedInAt: new Date(Date.now() - 3600000) // 1 hour ago
    });

    // ==========================================
    // 11. OTPS
    // ==========================================
    console.log('🔑 Setting up expired OTPs...');
    await OTP.create({ email: 'test@example.com', otp: '123456', createdAt: new Date(Date.now() - 1000000) }); // Expired

    console.log('====================================');
    console.log('🎉 SEEDING COMPLETE! 🎉');
    console.log('====================================');
    console.log('You can now log in using the following accounts:');
    console.log('');
    console.log('Password for all accounts is: Password@123');
    console.log('');
    console.log('🧑‍⚕️ DOCTORS');
    console.log('   General: ramesh.perera@curalink.com');
    console.log('   Cardio:  nimali.silva@curalink.com');
    console.log('   Derm:    amara.fernando@curalink.com');
    console.log('');
    console.log('🤒 PATIENTS');
    console.log('   Sanduni: sanduni@example.com');
    console.log('   Chamari: chamari@example.com (Has dangerous prescription)');
    console.log('   Kasun:   kasun@example.com (Has Triage Scan & Lab Booking)');
    console.log('');
    console.log('💉 NURSES');
    console.log('   Anoja:   anoja@curalink.com (Assigned to OPD Lab)');
    console.log('');
    console.log('🛡️ ADMINS & PHARMACIES');
    console.log('   Admin:    admin@curalink.com');
    console.log('   Pharmacy: pharmacy@curalink.com (Scan Chamari\'s token QR-CHAMARI-DANGER)');
    console.log('====================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

runSeeder();
