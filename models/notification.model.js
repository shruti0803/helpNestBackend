import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
    default: null
  },
  type: {
    type: String,
    enum: ['request', 'scheduled', 'bill'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // e.g., Booking ID or Bill ID
  },
  seenAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either user or helper is set, not both
notificationSchema.pre('save', function (next) {
  if (!this.user && !this.helper) {
    return next(new Error('Either user or helper must be set'));
  }
  if (this.user && this.helper) {
    return next(new Error('Only one of user or helper can be set'));
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
