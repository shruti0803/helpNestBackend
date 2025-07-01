import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: {
    type: String,
  },

 

  

  city: {
    type: String,
    enum: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Other'], // Customize as needed
    // required: true
  },

  phone: {
    type: String,
    
    match: [/^\d{10}$/, 'Phone number must be 10 digits'] // basic validation
  },

 emergencyNumber: {
  type: String,
  default: ''
},

 
},{
  timestamps: true // this adds `createdAt` and `updatedAt` automatically
});

export default mongoose.model('User', userSchema);
