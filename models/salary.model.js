import mongoose from 'mongoose';

const SalarySchema = new mongoose.Schema({
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
    required: true,
    unique: true // one entry per helper
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // optional: adds createdAt & updatedAt
});

const Salary = mongoose.model('Salary', SalarySchema);

export default Salary;
