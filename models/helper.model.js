import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
   
    unique: true,
    lowercase: true
  },

   password: {
    type: String,
  },
 

  phone: {
    type: String,
  
    match: [/^\d{10}$/, 'Enter a valid phone number']
  },

  city: {
    type: String,
  
  },

  trainingProgress: {
    type: Number,
    default: 0
  },

  testScore: {
    type: Number,
    default: 0
  },

  governmentId: {
    type: String,
    required: false
  },

  govDocumentUrl: {
    type: String,
    required: false // We'll check this after 7 days
  },

  accountNumber: {
    type: String,
    required: false
  },

  ifscCode: {
    type: String,
    required: false
  },

  submittedAt: {
    type: Date,
    default: Date.now
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },
  services: [{
  type: String,
  enum: [
    "Tech Support",
    "Medical Assistance",
    "Companionship",
    "Disability Support",
    "Errand Services",
    "Childcare"
  ],
  required: true
}]

});

// Scheduled check to mark inactive if no govDocument after 7 days
helperSchema.pre('save', function (next) {
  if (!this.govDocumentUrl) {
    const now = new Date();
    const submitted = new Date(this.submittedAt);
    const daysPassed = (now - submitted) / (1000 * 60 * 60 * 24);

    if (daysPassed > 7) {
      this.isActive = false;
    }
  }
  next();
});

export default mongoose.model('Helper', helperSchema);
