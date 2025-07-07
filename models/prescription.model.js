import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },

  fileUrl: { type: String, required: true },
  verified: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  adminNote: { type: String }
});

export default mongoose.model('Prescription', prescriptionSchema);
