import Admin from "../models/admin.model.js"
import jwt from "jsonwebtoken";
import Bill from '../models/bill.model.js'
import User from "../models/user.model.js";
import Helper from "../models/helper.model.js"
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





// controllers/earningController.js
import Earning from "../models/earning.model.js";

export const getEarningByMonth = async (req, res) => {
  try {
    const { month } = req.params; // expected format: "YYYY-MM"

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid or missing month format. Use YYYY-MM." });
    }

    const earning = await Earning.findOne({ month });

    if (!earning) {
      return res.status(404).json({ message: `No earnings found for ${month}` });
    }

    res.status(200).json(earning);
  } catch (error) {
    console.error("Error fetching earning:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





import Booking from "../models/booking.model.js";
export const getDailyBookings = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Parse inputs
    const numericMonth = parseInt(month) - 1; // JS months are 0-indexed
    const numericYear = parseInt(year);

    const startDate = new Date(numericYear, numericMonth, 1); // e.g., 2025-06-01
    const endDate = new Date(numericYear, numericMonth + 1, 1); // first day of next month

    const bookingsPerDay = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(bookingsPerDay); // [{ _id: "2025-06-03", count: 8 }, ...]
  } catch (err) {
    console.error('Error in getDailyBookings:', err);
    res.status(500).json({ error: 'Server error fetching bookings per day' });
  }
};




export const getUserSummary = async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get new users created in the last 7 days
    const newUsersLastWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo, $lte: now }
    });

    res.status(200).json({
      totalUsers,
      newUsersLastWeek
    });
  } catch (error) {
    console.error('Error fetching user summary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getHelperSummary = async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    // Get total users
    const totalHelpers = await Helper.countDocuments();

    // Get new users created in the last 7 days
    const newHelpersLastWeek = await Helper.countDocuments({
      createdAt: { $gte: oneWeekAgo, $lte: now }
    });

    res.status(200).json({
      totalHelpers,
      newHelpersLastWeek
    });
  } catch (error) {
    console.error('Error fetching helper summary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};







export const getBookingsByCategory = async (req, res) => {
  try {
    const categories = [
      "Tech Support",
      "Medical Assistance",
      "Companionship",
      "Disability Support",
      "Errand Services",
      "Childcare"
    ];

    const results = await Booking.aggregate([
      {
        $match: {
          service: { $in: categories }, // ✅ corrected field name
        },
      },
      {
        $group: {
          _id: '$service', // ✅ corrected grouping field
          count: { $sum: 1 },
        },
      },
    ]);

    // Fill in 0 for categories that had no bookings
    const response = categories.map(cat => {
      const found = results.find(r => r._id === cat);
      return {
        Service_Name: cat,
        booking_count: found ? found.count : 0,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching bookings by category:', error);
    res.status(500).json({ error: 'Failed to get bookings by category' });
  }
};






export const getBookingsByCity = async (req, res) => {
  try {
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Other'];

    const results = await Booking.aggregate([
      {
        $match: {
          city: { $in: cities },
        },
      },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
        },
      },
    ]);

    const response = cities.map(city => {
      const found = results.find(r => r._id === city);
      return {
        city,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching bookings by city:", error);
    res.status(500).json({ error: "Failed to fetch city-wise booking count" });
  }
};






export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // You can add filters here if needed
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllHelpers = async (req, res) => {
  try {
    const users = await Helper.find(); // You can add filters here if needed
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching helpers:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: 'userId',
        select: 'name email',
        model: 'User'
      })
      .populate({
        path: 'helperId',
        select: 'name email',
        model: 'Helper'
      })
      .populate({
        path: 'bookingId',
        select: 'service',
        model: 'Booking'
      });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};



export const verifyHelper = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedHelper = await Helper.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!updatedHelper) {
      return res.status(404).json({ message: 'Helper not found' });
    }

    res.status(200).json({ message: 'Helper verified', helper: updatedHelper });
  } catch (error) {
    console.error('Error verifying helper:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




import Salary from '../models/salary.model.js'



export const getPendingSalaries = async (req, res) => {
  try {
    const helpers = await Helper.find();

    const result = await Promise.all(
      helpers.map(async (helper) => {
        const salary = await Salary.findOne({ helperId: helper._id });

        return {
          id:helper.id,
          name: helper.name,
          phone: helper.phone,
          accountNumber: helper.accountNumber,
          ifscCode: helper.ifscCode,
          totalEarned: helper.totalEarned || 0,
          pendingAmount: salary?.pendingAmount || 0
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching pending salaries:', error);
    res.status(500).json({ message: 'Server error while fetching pending salaries' });
  }
};




export const paySalary = async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({ message: 'Helper ID is required' });
    }

    // Fetch salary record
    const salaryRecord = await Salary.findOne({ helperId });

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found for this helper' });
    }

    const pendingAmount = salaryRecord.pendingAmount;

    if (pendingAmount <= 0) {
      return res.status(400).json({ message: 'No pending amount to pay' });
    }

    // Update helper totalEarned
    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ message: 'Helper not found' });
    }

    helper.totalEarned = (helper.totalEarned || 0) + pendingAmount;
    await helper.save();

    // Set salary pendingAmount to 0
    salaryRecord.pendingAmount = 0;
    await salaryRecord.save();

    return res.status(200).json({
      message: 'Salary paid successfully',
      paidAmount: pendingAmount,
      helper: {
        id: helper._id,
        name: helper.name,
        totalEarned: helper.totalEarned,
      },
    });
  } catch (error) {
    console.error('Error paying salary:', error);
    return res.status(500).json({ message: 'Server error during salary payment' });
  }
};



