import Admin from "../models/admin.model.js"
import jwt from "jsonwebtoken";

// 🔐 Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Admin doesn't exist",
        success: false,
      });
    }

    if (password !== admin.password) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const tokenData = {
      adminId: admin._id,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    console.log("🔐 Admin TOKEN_SECRET:", process.env.TOKEN_SECRET);

    return res
      .status(201)
      .cookie("adminToken", token, {
        expires: new Date(Date.now() + 86400000), // 1 day
        httpOnly: true,
      })
      .json({
        message: `Welcome back, ${admin.name}`,
        admin,
        success: true,
      });
  } catch (error) {
    console.error("🟥 Admin Login Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const adminLogout = (req, res) => {
  res.cookie("adminToken", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  return res.status(200).json({
    message: "Admin logged out successfully",
    success: true,
  });
};
export const getAdminProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log("👤 Admin profile request:", req.user);
    return res.status(200).json({ admin });
  } catch (error) {
    console.error("🟥 Error in getAdminProfile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
