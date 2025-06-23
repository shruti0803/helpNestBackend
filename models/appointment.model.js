import mongoose from "mongoose";

const AppointmentScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true }, // e.g., "Dental Checkup"
  location: { type: String }, // optional
  doctor: { type: String }, // optional: doctor or person name
  notes: { type: String }, // any additional notes
  reminder: { type: Boolean, default: false },
   phone: {
    type: String,
    
    match: [/^\d{10}$/, 'Phone number must be 10 digits'] // basic validation
  },
  schedule: [
    {
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true }, // e.g., "morning", "afternoon"
      status: {
        type: String,
        enum: ["missed", "done"],
        default: "missed"
      }
    }
  ]
},{
  timestamps: true // this adds `createdAt` and `updatedAt` automatically
});

const AppointmentSchedule = mongoose.model("AppointmentSchedule", AppointmentScheduleSchema);
export default AppointmentSchedule;
