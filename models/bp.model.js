import mongoose from 'mongoose';

const bpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true }, // Store as UTC midnight
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("BloodPressure", bpSchema);
