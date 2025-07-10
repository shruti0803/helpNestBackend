import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedHelper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helper',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    details: {
      type: String,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
