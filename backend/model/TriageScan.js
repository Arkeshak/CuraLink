import mongoose from 'mongoose';

/**
 * TriageScan — stores CNN visual triage results from patient image uploads.
 * The image is analyzed via Gemini Vision to return an urgency flag.
 */
const triageScanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: { type: String, required: true },

    // Raw model output description
    modelResult: { type: String },

    // Urgency classification
    urgencyFlag: {
      type: String,
      enum: ['Low', 'Monitor', 'See Doctor Soon', 'Emergency'],
      required: true,
    },
    urgencyScore: { type: Number, min: 0, max: 1 },

    // Detected conditions / observations
    observations: [{ type: String }],
    
    // Possible conditions/diseases
    possibleConditions: [{ type: String }],

    // Recommended specialist based on visual analysis
    recommendedSpecialist: { type: String },

    // Whether this triage led to a booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  },
  { timestamps: true }
);

const TriageScan = mongoose.model('TriageScan', triageScanSchema);
export default TriageScan;
