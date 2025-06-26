import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Helper",
    default: null, // added later when one accepts
  },
  service: {
    type: String,
    enum: ["Tech Support", "Medical Assistance", "Companionship", "Disability Support", "Errand Services", "Childcare"],
    required: true,
  },
  address:{
type:String,
required: true
  },
  city: {
    type: String,
    enum: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Other'], // Customize as needed
    required: true
  },
  personName: {
    type: String,
    required: true, // name of person for whom booking is made
  },
  phone: {
    type: String,
    required: true, // contact for the booked person
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // e.g., "10:30 AM" or "15:00"
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Scheduled", "Completed"],
    default: "Pending",
  },
  isCompleted:{
    type: Boolean,
    default: false,
  },
 genderPreference: {
  type: String,
  enum: ["Male", "Female", "Any"],
  default: "Any",
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: { type: String, default: null },
 otpVerified:{
  type: Boolean,
  default: false
 },
otpGeneratedAt: { type: Date, default: null }

});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
