import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: "Helper", required: true },

  // New additions
  totalHours: { type: Number, required: true },           // e.g. 4
  ratePerHour: { type: Number, required: true },          // e.g. ₹120
  description: { type: String, required: true },          // e.g. Assisted with daily tasks

  // Auto-calculated
  baseAmount: { type: Number, required: true },           // = totalHours * ratePerHour
  userPlatformFee: { type: Number, required: true },      // = 5% of baseAmount
  totalAmountPaid: { type: Number, required: true },      // = baseAmount + platformFee

  paymentMode: { 
    type: String, 
    enum: ['UPI', 'Online', 'Netbanking', 'Wallet', 'Cash'], 
    required: true 
  },

  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid'], 
    default: 'Pending' 
  },

  paymentId: { type: String }, // Razorpay payment ID (optional)

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true // this adds `createdAt` and `updatedAt` automatically
});

export default mongoose.model('Bill', BillSchema);
