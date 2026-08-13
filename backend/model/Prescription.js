import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    medicines: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      notes: { type: String },
    }],
    instructions: { type: String },
    diagnosisNote: { type: String },

    // QR code for pharmacy handoff
    qrCode: { type: String },           // base64 data URL of QR image
    qrToken: { type: String, unique: true, sparse: true }, // unique redeemable token

    // Redemption tracking
    redeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // pharmacy user

    // Drug interaction warning (populated at redemption time)
    interactionWarnings: [{ type: String }],

    // Status
    status: {
      type: String,
      enum: ['issued', 'redeemed', 'expired', 'cancelled'],
      default: 'issued',
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
