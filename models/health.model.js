import mongoose from "mongoose";
const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, required: true },
  days: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
  taken: { type: Boolean, default: false },  // Refreshed daily if applicable
});

const appointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },         // e.g. "Doctor visit"
  day: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
  time: { type: String, required: true },          // e.g. "03:00 PM"
  done: { type: Boolean, default: false },         // Marks whether it's completed
});

const healthSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    medicine: [medicineSchema],
    appointments: [appointmentSchema],

    waterIntake: { count: { type: Number, default: 0 } },
    sleep: {
      hours: Number,
      sleptAt: String,
      wokeAt: String,
    },
    exercise: {
      didExercise: { type: Boolean, default: false },
      type: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

healthSchema.index({ user: 1, date: 1 }, { unique: true });
export default mongoose.model("Health", healthSchema);
