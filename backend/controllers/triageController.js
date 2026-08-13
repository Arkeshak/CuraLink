import TriageScan from '../model/TriageScan.js';
import fs from 'fs';

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGeminiVision(apiKey, modelName, imageBase64, mimeType, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: imageBase64 } },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[${response.status}] ${err}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// @desc    Visual triage — patient uploads a symptom image → CNN-style urgency flag
// @route   POST /api/triage/scan
// @access  Private (patient)
export const triageScan = async (req, res) => {
  try {
    const patientId = req.user.id;
    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded.' });
    }
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API Key missing.' });
    }

    const { mimetype, path: filePath, originalname } = req.file;
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    const prompt = `You are a medical visual triage AI assistant. Analyze this patient-submitted image of a visible symptom or skin condition.

Respond ONLY in strict JSON matching this structure:
{
  "urgencyFlag": "Low" | "Monitor" | "See Doctor Soon" | "Emergency",
  "urgencyScore": 0.0 to 1.0,
  "observations": ["Observation 1", "Observation 2"],
  "possibleConditions": ["Condition 1", "Condition 2", "Condition 3"],
  "recommendedSpecialist": "Dermatologist | General Practitioner | Emergency Medicine | etc.",
  "modelResult": "A brief plain-English description of what you observe in the image",
  "disclaimer": "This is an AI-assisted visual triage, not a medical diagnosis. Please consult a healthcare professional."
}

Urgency scale:
- Low (0.0–0.25): Appears minor, no immediate concern
- Monitor (0.25–0.5): Worth keeping an eye on, schedule a check-up if persists
- See Doctor Soon (0.5–0.75): Should see a doctor within 1–3 days
- Emergency (0.75–1.0): Requires immediate medical attention

Be conservative — when in doubt, escalate the urgency level.`;

    let parsed = null;
    let lastErr;
    for (const model of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const text = await callGeminiVision(apiKey, model, base64, mimetype, prompt);
          if (text) {
            parsed = JSON.parse(text.trim());
            break;
          }
        } catch (err) {
          lastErr = err;
          if (err.message.includes('429') || err.message.includes('503')) {
            await sleep(Math.pow(2, attempt) * 1000);
          } else break;
        }
      }
      if (parsed) break;
    }

    if (!parsed) throw new Error(`Triage analysis failed: ${lastErr?.message}`);

    // Save scan result
    const scan = await TriageScan.create({
      patient: patientId,
      imageUrl: filePath.replace(/\\/g, '/'),
      modelResult: parsed.modelResult,
      urgencyFlag: parsed.urgencyFlag,
      urgencyScore: parsed.urgencyScore,
      observations: parsed.observations,
      possibleConditions: parsed.possibleConditions || [],
      recommendedSpecialist: parsed.recommendedSpecialist,
    });

    res.status(200).json({
      success: true,
      data: {
        ...parsed,
        scanId: scan._id,
        imageUrl: scan.imageUrl,
      },
    });
  } catch (error) {
    console.error('[triageScan]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient triage scan history
// @route   GET /api/triage/history
// @access  Private (patient)
export const getTriageHistory = async (req, res) => {
  try {
    const scans = await TriageScan.find({ patient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
