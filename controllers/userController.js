import User from '../models/user.model.js';
// import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, gender, age, city } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      phone,
      gender,
      age,
      city
    });

    await newUser.save();

    // Create JWT token just like in login
    const tokenData = {
      userId: newUser._id
    };
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: "1d" });
   // console.log("TOKEN_SECRET in register:", process.env.TOKEN_SECRET);


    // Set token in cookie
    res.status(201)
      .cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }) // 1 day
      .json({
        message: 'User registered successfully',
        user: { email: newUser.email, name: newUser.name },
        success: true
      });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};






export const userLogin=async (req, res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(401).json({
                message:"All fields are required",
                success:false
            })
        };
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"user doesn't exist",
                success:false
            })
        }
        if (password !== user.password) {
  return res.status(401).json({
    message: "Incorrect email or password",
    success: false
  });
}

        const tokenData={
            userId:user._id
        }
        const token=await jwt.sign(tokenData, process.env.TOKEN_SECRET,{expiresIn:"1d"});
       // console.log("TOKEN_SECRET in login:", process.env.TOKEN_SECRET);

        return res.status(201).cookie("token", token,{expiresIn:"1d", httpOnly:true} ).json({
            message:`Welcome back ${
        user.name}`,
        user,
    success:true
})
        }catch(error){
console.log(error);
    }
}

//logout
export const Logout=(req,res)=>{
  req.session.destroy(); // clear old session
  localStorage.removeItem("token"); 
   res.redirect("/");
  return res.cookie("token", "", {expiresIn:new Date(Date.now())}).json({
    
    message:"user logged out successfully",
    success: true
  })
}



export const getMyProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
console.log("In /profile, req.user:", req.user);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("🟥 Error in getMyProfile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};







// Middleware for auth (if you want, you can keep this in a separate file too)
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}



export const addEmergencyNumber = async (req, res) => {
  try {
    const userId = req.user.id; // assuming auth middleware adds req.user
    const { emergencyNumber } = req.body;

    if (!emergencyNumber || emergencyNumber.length < 8) {
      return res.status(400).json({ message: 'Invalid emergency number' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { emergencyNumber },
      { new: true }
    ).select('-password');

    res.status(200).json({ message: 'Emergency number updated', user });
  } catch (error) {
    console.error('Error updating emergency number:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


import sendSMS from '../Sms/sendSms.js';

export const sendEmergencyMessage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.emergencyNumber) {
      return res.status(400).json({ message: "Emergency number not set" });
    }

    const emergencyMessage = `🚨 Emergency Alert: ${user.name || 'A user'} needs urgent help! Please reach out immediately.`;

    await sendSMS(`+91${user.emergencyNumber}`, emergencyMessage);

    res.status(200).json({ message: "Emergency alert sent" });
  } catch (error) {
    console.error("❌ Error sending emergency alert:", error.message);
    res.status(500).json({ message: "Failed to send emergency message" });
  }
};