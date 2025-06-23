import mongoose from "mongoose";

const MedicineScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["tablet", "injection", "syrup"], required: true },
  name: { type: String, required: true },
  dosage: String,
  notes: String,
  reminder: { type: Boolean, default: false },
  phone: {
    type: String,
    
    match: [/^\d{10}$/, 'Phone number must be 10 digits'] // basic validation
  },
  schedule: [
    {
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true }, // "morning", "evening", etc.
      status: {
        type: String,
        enum: ["missed", "taken"],
        default: "missed"
      }
    }
  ]
},{
  timestamps: true // this adds `createdAt` and `updatedAt` automatically
});

const MedicineSchedule = mongoose.model("MedicineSchedule", MedicineScheduleSchema);
export default MedicineSchedule;
