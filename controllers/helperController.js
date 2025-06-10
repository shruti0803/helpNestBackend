import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import Helper from '../models/helper.model.js';

export const registerHelper = async (req, res) => {
  try {
    const { name, email, password, phone, city,services } = req.body;

    const existing = await Helper.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered', success: false });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newHelper = await Helper.create({
      name,
      email,
      password,
      phone,
      city,
      services,
    });

    const tokenData = {
      userId: newHelper._id,
      role: 'helper'
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: '1d' });

    res.status(201)
      .cookie('helper_token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'Lax',
        secure: false, // Set to true in production with HTTPS
      })
      .json({
        message: 'Helper registered successfully',
        helper: { name: newHelper.name, email: newHelper.email },
        success: true
      });

  } catch (error) {
    console.error('Helper Register Error:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};

export const loginHelper = async (req, res) => {
  try {
    const { email, password } = req.body;

    const helper = await Helper.findOne({ email });
    if (!helper) {
      return res.status(404).json({ message: 'Helper not found', success: false });
    }

    if (helper.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }

    const tokenData = {
      userId: helper._id,
      role: 'helper'
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, { expiresIn: '1d' });

    res.status(200)
      .cookie('helper_token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'Lax',
        secure: false, // Set to true in production with HTTPS
      })
      .json({
        message: 'Helper logged in successfully',
        helper: { name: helper.name, email: helper.email },
        success: true
      });

  } catch (error) {
    console.error('Helper Login Error:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};

export const updateHelperDetails = async (req, res) => {
  try {
    console.log("req.helper:", req.helper);
    const helperId = req.helper?.id;
    console.log("helperId:", helperId);

    if (!helperId) {
      return res.status(401).json({ message: "Unauthorized - helperId missing" });
    }

    const { city, phone,governmentId, govDocumentUrl, accountNumber, ifscCode } = req.body;
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ message: 'Helper not found', success: false });
    }
  helper.city=city;
  helper.phone=phone;
    helper.governmentId = governmentId;
    helper.accountNumber = accountNumber;
    helper.ifscCode = ifscCode;
    helper.submittedAt = new Date();

    if (req.file) {
      helper.govDocumentUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else if (govDocumentUrl) {
      helper.govDocumentUrl = govDocumentUrl;
    }

    await helper.save();

    res.status(200).json({
      message: 'Helper details updated successfully',
      success: true,
      helper,
    });

  } catch (error) {
    console.error('Update Helper Details Error:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};



export const getHelperProfile = async (req, res) => {
  try {
    const helperId = req.helper.id;

    const helper = await Helper.findById(helperId).select("-password");
    if (!helper) {
      return res.status(404).json({ message: "Helper not found", success: false });
    }

    res.status(200).json(helper);
    console.log("In /profile, req.helper:", req.helper);
  } catch (error) {
    console.error("Get Helper Profile Error:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// import bcrypt from 'bcryptjs';






// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, phone, gender, age, city } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash password
//     //const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       password,
//       phone,
//       gender,
//       age,
//       city
//     });

//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully', user: { email: newUser.email, name: newUser.name } });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }




  
// };



//logout
export const Logout = (req, res, next) => {
  console.log("Logout API called");  // Check if request reaches here

  // Clear the cookie explicitly on logout
  res.clearCookie('helper_token', { path: '/' });  // specify path if needed
  console.log("Cleared cookie 'helper_token'");

  return res.json({ message: "Helper logged out successfully", success: true });
};







 










export const getTrainingProgress = async (req, res) => {
  try {
    const helper = await Helper.findById(req.helper.id);
    if (!helper) return res.status(404).json({ error: "Helper not found" });
    res.json({ trainingProgress: helper.trainingProgress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const updateTrainingProgress = async (req, res) => {
  const { trainingProgress } = req.body;
  if (typeof trainingProgress !== "number") {
    return res.status(400).json({ error: "trainingProgress must be a number" });
  }
  try {
    const helper = await Helper.findById(req.helper.id);
    if (!helper) return res.status(404).json({ error: "Helper not found" });

    if (trainingProgress > helper.trainingProgress) {
      helper.trainingProgress = trainingProgress;
      await helper.save();
    }

    res.json({ message: "Progress updated", trainingProgress: helper.trainingProgress });
    console.log(req.body) ;
    console.log(req.helper);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getTestScore = async (req, res) => {
  try {
    const helper = await Helper.findById(req.helper.id).select("testScore");
    if (!helper) return res.status(404).json({ message: "Helper not found" });

    res.status(200).json({ testScore: helper.testScore });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//update score
export const updateTestScore = async (req, res) => {
  const { testScore } = req.body;

  if (typeof testScore !== "number") {
    return res.status(400).json({ message: "testScore must be a number" });
  }

  try {
    const helper = await Helper.findById(req.helper.id);
    if (!helper) return res.status(404).json({ message: "Helper not found" });

    // If already scored 8 or more, don't allow update
    if (helper.testScore >= 8) {
      return res.status(403).json({ message: "Test already passed. Cannot retake.", testScore: helper.testScore });
    }

    helper.testScore = testScore;
    await helper.save();

    res.status(200).json({ message: "Test score updated", testScore: helper.testScore });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// PATCH /api/helpers/select-services
// PATCH /api/helpers/select-services
export const selectServices = async (req, res) => {
  try {
    const helperId = req.helper.id; // ✅ FIXED: use req.helper instead of req.user
    const { services } = req.body;

    const updatedHelper = await Helper.findByIdAndUpdate(
      helperId,
      { services },
      { new: true }
    );

    res.status(200).json({ message: "Services updated successfully", helper: updatedHelper });
  } catch (error) {
    console.error("Error updating services:", error);
    res.status(500).json({ message: "Failed to update services", error: error.message });
  }
};

