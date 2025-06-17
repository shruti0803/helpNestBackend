import mongoose from "mongoose";

const MedicineScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["tablet", "injection", "syrup"], required: true },
  name: { type: String, required: true },
  dosage: String,
  notes: String,
  reminder: { type: Boolean, default: false },

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
});

const MedicineSchedule = mongoose.model("MedicineSchedule", MedicineScheduleSchema);
export default MedicineSchedule;
