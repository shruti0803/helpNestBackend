import Admin from "../models/admin.model.js"
import jwt from "jsonwebtoken";
import Bill from '../models/bill.model.js'
import User from "../models/user.model.js";
import Helper from "../models/helper.model.js"
import Review from "../models/review.model.js";
import Shop from "../models/shop.model.js";
import Prescription from "../models/prescription.model.js"
import Cart from "../models/cart.model.js"
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

    // console.log("👤 Admin profile request:", req.user);
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



export const getOverallRatingStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Optional: sort by star (1 to 5)
      }
    ]);

    // Map to hold 1-5 star counts
    const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatings = 0;
    let totalPoints = 0;

    stats.forEach(stat => {
      ratingMap[stat._id] = stat.count;
      totalRatings += stat.count;
      totalPoints += stat._id * stat.count;
    });

    const averageRating = totalRatings ? (totalPoints / totalRatings).toFixed(2) : 0;

    res.status(200).json({
      averageRating: Number(averageRating),
      totalRatings,
      ratingBreakdown: ratingMap
    });
  } catch (error) {
    console.error('Error in getOverallRatingStats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getShopProductCount = async (req, res) => {
  try {
    const count = await Shop.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching shop product count:", error);
    res.status(500).json({ message: "Failed to fetch product count" });
  }
};


export const getBookingCount = async (req, res) => {
  try {
    const count = await Booking.countDocuments({});
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching shop product count:", error);
    res.status(500).json({ message: "Failed to fetch product count" });
  }
};

import moment from 'moment';
import Order from "../models/order.model.js";



export const getOrdersPerWeek = async (req, res) => {
  try {
    const today = moment.utc().endOf('day'); // use UTC
    const sixWeeksAgo = moment.utc().subtract(5, 'weeks').startOf('isoWeek'); // use UTC

    const orders = await Order.aggregate([
      {
        $match: {
          orderedAt: {
            $gte: sixWeeksAgo.toDate(),
            $lte: today.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: '$orderedAt' },
            year: { $isoWeekYear: '$orderedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);

    const result = [];

    for (let i = 0; i < 6; i++) {
      const weekStart = moment.utc().subtract(5 - i, 'weeks').startOf('isoWeek');
      const year = weekStart.isoWeekYear();
      const week = weekStart.isoWeek();
      const label = `Week ${week}`;

      const match = orders.find(
        (o) => o._id.week === week && o._id.year === year
      );

      result.push({
        label,
        count: match ? match.count : 0,
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching weekly orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



export const getUnverifiedPrescriptions = async (req, res) => {
  try {
    // Find only prescriptions which are neither verified nor rejected
    const prescriptions = await Prescription.find({ verified: false, rejected: false })
      .populate('medicine', 'name') // Pull `name` field from Shop model
      .populate('user', 'name')     // Pull `name` field from User model
      .lean(); // makes the returned docs plain JS objects, not Mongoose docs

    res.json(prescriptions); // ✅ finally return the actual populated data
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

export const verifyPrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find prescription with populated fields
    const prescription = await Prescription.findById(id).populate('medicine').populate('user');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.verified) {
      return res.status(400).json({ error: 'Prescription already verified' });
    }

    // 2. Mark as verified
    prescription.verified = true;
    prescription.verifiedAt = new Date();
    await prescription.save();

    const userId = prescription.user._id;
    const medicineId = prescription.medicine._id;

    // 3. Add medicine to user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // if no cart exists, create one
      cart = new Cart({
        userId,
        items: [{ medicineId, quantity: 1 }]
      });
    } else {
      // check if item already exists in cart
      const existingItem = cart.items.find(item => item.medicineId.equals(medicineId));

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ medicineId, quantity: 1 });
      }
    }

    await cart.save();

    res.json({ message: 'Prescription verified and item added to cart' });
  } catch (err) {
    console.error('Error verifying prescription:', err);
    res.status(500).json({ error: 'Failed to verify prescription' });
  }
};