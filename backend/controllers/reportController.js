import Report from '../model/Report.js';
import RAGQuery from '../model/RAGQuery.js';
import fs from 'fs';
import path from 'path';

// ── Gemini model fallback list ────────────────────────────────────────────────
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Call Gemini REST API ──────────────────────────────────────────────────────
async function callGeminiRaw(apiKey, modelName, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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

// ── Get embeddings via Gemini embedding model ────────────────────────────────
async function getEmbedding(apiKey, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'models/text-embedding-004', content: { parts: [{ text }] } }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding error: ${err}`);
  }
  const data = await response.json();
  return data.embedding?.values ?? [];
}

// ── Cosine similarity between two vectors ────────────────────────────────────
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

// ── Chunk text into ~500-char segments with overlap ──────────────────────────
function chunkText(text, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({ text: text.slice(start, end), startChar: start, endChar: end });
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }
  return chunks;
}

// ── OCR: Extract text from PDF/image using Gemini Vision ────────────────────
async function extractTextViaGemini(apiKey, fileBuffer, mimeType) {
  const base64 = fileBuffer.toString('base64');
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: 'Extract all text from this medical document. Return only the raw text content, preserving structure like tables and values. No commentary.' },
        { inlineData: { mimeType, data: base64 } },
      ],
    }],
  };

  let lastError;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await callGeminiRaw(apiKey, model, body);
        if (text) return text;
      } catch (err) {
        lastError = err;
        if (err.message.includes('429') || err.message.includes('503')) {
          await sleep(Math.pow(2, attempt) * 1000);
        } else break;
      }
    }
  }
  throw new Error(`OCR failed: ${lastError?.message}`);
}

// @desc    Upload a lab report PDF/image, OCR it, embed chunks, store for RAG
// @route   POST /api/reports/upload
// @access  Private (patient)
export const uploadReport = async (req, res) => {
  try {
    const patientId = req.user.id;
    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API Key is missing.' });
    }

    const { originalname, mimetype, path: filePath } = req.file;

    // Create initial report record
    const report = await Report.create({
      patient: patientId,
      fileName: originalname,
      fileUrl: filePath.replace(/\\/g, '/'),
      mimeType: mimetype,
      status: 'processing',
    });

    // Process async — respond immediately with the pending report
    res.status(202).json({ success: true, message: 'Report uploaded. Processing started.', data: report });

    // ── Background: OCR → chunk → embed → save ──────────────────────────────
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ocrText = await extractTextViaGemini(apiKey, fileBuffer, mimetype);

      const rawChunks = chunkText(ocrText);
      const embeddedChunks = [];

      for (const chunk of rawChunks) {
        try {
          const embedding = await getEmbedding(apiKey, chunk.text);
          embeddedChunks.push({ ...chunk, embedding });
          await sleep(200); // rate-limit embedding calls
        } catch (embErr) {
          console.warn(`[Report] Embedding failed for chunk, storing without embedding: ${embErr.message}`);
          embeddedChunks.push({ ...chunk, embedding: [] });
        }
      }

      await Report.findByIdAndUpdate(report._id, {
        ocrText,
        chunks: embeddedChunks,
        status: 'ready',
      });

      console.log(`[Report] ✓ Report ${report._id} processed: ${embeddedChunks.length} chunks embedded.`);
    } catch (processErr) {
      await Report.findByIdAndUpdate(report._id, {
        status: 'failed',
        processingError: processErr.message,
      });
      console.error(`[Report] ✗ Processing failed for ${report._id}:`, processErr.message);
    }
  } catch (error) {
    console.error('[uploadReport]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all reports for the logged-in patient
// @route   GET /api/reports
// @access  Private (patient)
export const getMyReports = async (req, res) => {
  try {
    const patientId = req.user.id;
    const reports = await Report.find({ patient: patientId })
      .select('-chunks.embedding') // don't send vectors to client
      .sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single report (no embeddings sent)
// @route   GET /api/reports/:id
// @access  Private (patient)
export const getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, patient: req.user.id })
      .select('-chunks.embedding');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    RAG Q&A — ask a question about one or all patient reports
// @route   POST /api/reports/:id/ask   (or /api/reports/ask for all)
// @access  Private (patient)
export const askReport = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { question } = req.body;
    const reportId = req.params.id !== 'ask' ? req.params.id : null;
    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;

    if (!question) return res.status(400).json({ success: false, message: 'Question is required.' });
    if (!apiKey) return res.status(500).json({ success: false, message: 'Gemini API Key missing.' });

    // Fetch relevant reports
    const query = { patient: patientId, status: 'ready' };
    if (reportId) query._id = reportId;
    const reports = await Report.find(query);

    if (!reports.length) {
      return res.status(404).json({ success: false, message: 'No processed reports found. Please upload a report first.' });
    }

    // ── RAG: embed question → find top-k similar chunks ─────────────────────
    const questionEmbedding = await getEmbedding(apiKey, question);

    const allScoredChunks = [];
    for (const report of reports) {
      for (const chunk of report.chunks) {
        if (!chunk.embedding?.length) continue;
        const score = cosineSimilarity(questionEmbedding, chunk.embedding);
        allScoredChunks.push({
          reportId: report._id,
          reportName: report.fileName,
          text: chunk.text,
          score,
        });
      }
    }

    // Top 5 most relevant chunks
    const topChunks = allScoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // ── Build RAG prompt ─────────────────────────────────────────────────────
    const context = topChunks
      .map((c, i) => `[Source ${i + 1} — ${c.reportName}]\n${c.text}`)
      .join('\n\n---\n\n');

    const prompt = `You are CuraLink's medical AI assistant. A patient is asking a question about their own medical reports.

Use ONLY the provided report excerpts below to answer the question. If the answer is not clearly in the excerpts, say so honestly. Always include a disclaimer that this is informational and not a substitute for professional medical advice.

REPORT EXCERPTS:
${context}

PATIENT QUESTION: ${question}

Respond in clear, plain language that a patient can understand. If the excerpts mention specific values (e.g., ALT 45 U/L), reference them explicitly.`;

    // ── Call Gemini for grounded answer ─────────────────────────────────────
    let answer = null;
    let lastErr;
    for (const model of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          answer = await callGeminiRaw(apiKey, model, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });
          if (answer) break;
        } catch (err) {
          lastErr = err;
          if (err.message.includes('429') || err.message.includes('503')) {
            await sleep(Math.pow(2, attempt) * 1000);
          } else break;
        }
      }
      if (answer) break;
    }
    if (!answer) throw new Error(`All models failed: ${lastErr?.message}`);

    // ── Persist the query ────────────────────────────────────────────────────
    const ragQuery = await RAGQuery.create({
      patient: patientId,
      report: reportId || undefined,
      question,
      retrievedChunks: topChunks,
      answer,
    });

    res.status(200).json({
      success: true,
      data: {
        answer,
        sources: topChunks.map((c) => ({ reportName: c.reportName, excerpt: c.text.slice(0, 150) + '…', score: c.score })),
        queryId: ragQuery._id,
      },
    });
  } catch (error) {
    console.error('[askReport]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get RAG chat history for the patient (or for a specific report)
// @route   GET /api/reports/:id/history  (or /api/reports/history)
// @access  Private (patient)
export const getReportHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const filter = { patient: patientId };
    if (req.params.id && req.params.id !== 'history') filter.report = req.params.id;

    const history = await RAGQuery.find(filter)
      .select('-retrievedChunks.score')
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (patient)
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    // Clean up file
    if (report.fileUrl && fs.existsSync(report.fileUrl)) {
      fs.unlinkSync(report.fileUrl);
    }
    res.status(200).json({ success: true, message: 'Report deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
