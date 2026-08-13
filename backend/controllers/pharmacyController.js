import Prescription from '../model/Prescription.js';
import User from '../model/User.js';
import { randomUUID } from 'crypto';

// ── Gemini helper for drug interaction checks ─────────────────────────────────
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkDrugInteractionsWithGemini(apiKey, medicines, patientAllergies = []) {
  const drugList = medicines.map((m) => `${m.name} (${m.dosage})`).join(', ');
  const allergyList = patientAllergies.length ? patientAllergies.join(', ') : 'none listed';

  const prompt = `You are a pharmacist AI. Check the following drugs for known interactions and allergy risks.

Drugs: ${drugList}
Patient allergies: ${allergyList}

Respond ONLY in strict JSON:
{
  "interactions": ["Interaction warning 1 if any", "..."],
  "allergyWarnings": ["Allergy warning 1 if any", "..."],
  "safe": true | false
}

If no interactions or allergy concerns, return empty arrays and safe: true.`;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text.trim());
      } catch (err) {
        if (err.message?.includes('429') || err.message?.includes('503')) {
          await sleep(Math.pow(2, attempt) * 1000);
        } else break;
      }
    }
  }
  return { interactions: [], allergyWarnings: [], safe: true };
}

// @desc    Generate QR token for an existing prescription
// @route   POST /api/pharmacy/prescriptions/:id/generate-qr
// @access  Private (doctor)
export const generateQRCode = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name')
      .populate('doctor', 'name');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    if (prescription.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Generate unique token
    const qrToken = randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12);

    // Set 30-day expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Prescription.findByIdAndUpdate(prescription._id, { qrToken, expiresAt });

    res.status(200).json({ success: true, data: { qrToken, expiresAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pharmacy redeems a prescription by QR token
// @route   POST /api/pharmacy/redeem
// @access  Private (pharmacy)
export const redeemPrescription = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const pharmacyUserId = req.user.id;
    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;

    if (!qrToken) return res.status(400).json({ success: false, message: 'QR token is required.' });

    const prescription = await Prescription.findOne({ qrToken })
      .populate('patient', 'name allergies activeMedications')
      .populate('doctor', 'name specialization');

    if (!prescription) return res.status(404).json({ success: false, message: 'Invalid QR code.' });
    if (prescription.redeemed) {
      return res.status(400).json({ success: false, message: 'This prescription has already been redeemed.' });
    }
    if (prescription.expiresAt && prescription.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This prescription has expired.' });
    }

    // Drug interaction check
    let interactionResult = { interactions: [], allergyWarnings: [], safe: true };
    if (apiKey) {
      const patientAllergies = prescription.patient?.allergies || [];
      interactionResult = await checkDrugInteractionsWithGemini(
        apiKey,
        prescription.medicines,
        patientAllergies
      );
    }

    // Mark as redeemed
    await Prescription.findByIdAndUpdate(prescription._id, {
      redeemed: true,
      redeemedAt: new Date(),
      redeemedBy: pharmacyUserId,
      status: 'redeemed',
      interactionWarnings: [
        ...interactionResult.interactions,
        ...interactionResult.allergyWarnings,
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        prescription,
        drugCheck: interactionResult,
        redeemedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List prescriptions available at pharmacy (not yet redeemed)
// @route   GET /api/pharmacy/prescriptions
// @access  Private (pharmacy)
export const listPharmacyPrescriptions = async (req, res) => {
  try {
    const { status = 'issued' } = req.query;
    const prescriptions = await Prescription.find({ status })
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Standalone drug interaction check (no prescription required)
// @route   POST /api/pharmacy/check-drugs
// @access  Private (pharmacy, doctor, nurse, admin)
export const checkDrugs = async (req, res) => {
  try {
    const { drugs = [], allergies = [] } = req.body;

    if (!Array.isArray(drugs) || drugs.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide at least 2 drug names.' });
    }

    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API Key not configured.' });
    }

    // Reuse the same Gemini helper — convert plain strings into medicine objects
    const medicineObjects = drugs.map((name) => ({ name, dosage: '' }));
    const result = await checkDrugInteractionsWithGemini(apiKey, medicineObjects, allergies);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
