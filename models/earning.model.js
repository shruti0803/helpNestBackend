import mongoose from 'mongoose';

const EarningSchema = new mongoose.Schema({
  month: {
    type: String, // format: "YYYY-MM" e.g., "2025-06"
    required: true,
    unique: true // one entry per month
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSalaries: {
    type: Number,
    default: 0,
    min: 0
  },
  profit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // optional: adds createdAt & updatedAt
});

const Earning = mongoose.model('Earning', EarningSchema);

export default Earning;
