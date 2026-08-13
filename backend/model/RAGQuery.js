import mongoose from 'mongoose';

/**
 * RAGQuery — logs every patient Q&A interaction against their own reports.
 * Stores the question, which chunks were retrieved, and the final answer
 * so we can display conversation history and audit AI responses.
 */
const ragQuerySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      // null if query spans all patient reports
    },
    question: { type: String, required: true },

    // Top-k chunks retrieved for this query
    retrievedChunks: [
      {
        reportId: mongoose.Schema.Types.ObjectId,
        reportName: String,
        text: { type: String },
        score: Number, // cosine similarity score
      },
    ],

    answer: { type: String, required: true },
    modelUsed: { type: String, default: 'gemini-2.0-flash' },
  },
  { timestamps: true }
);

const RAGQuery = mongoose.model('RAGQuery', ragQuerySchema);
export default RAGQuery;
