import mongoose from 'mongoose';

/**
 * Report — patient lab report / document with OCR text stored for RAG Q&A.
 * Embeddings are stored as simple float arrays alongside the text chunks
 * so we can do cosine-similarity retrieval without an external vector DB.
 */
const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },

    // OCR / extracted text (full document)
    ocrText: { type: String, default: '' },

    // Chunked text with embeddings for RAG retrieval
    chunks: [
      {
        text: { type: String, required: true },
        embedding: [{ type: Number }], // Gemini text-embedding-004 vector
        startChar: Number,
        endChar: Number,
      },
    ],

    // Processing status
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    processingError: { type: String },

    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
