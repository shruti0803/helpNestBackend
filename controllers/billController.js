import Booking from "../models/booking.model.js";
import Bill from "../models/bill.model.js";

// Create a bill (after payment is initiated or completed)
export const createBill = async (req, res) => {
  try {
    const {
      bookingId,
      totalHours,
      ratePerHour,
      description,
      paymentMode,
      paymentId,
    } = req.body;

    if (!bookingId || !totalHours || !ratePerHour || !description || !paymentMode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Auto-calculate billing fields
    const baseAmount = totalHours * ratePerHour;
    const userPlatformFee = Math.round(baseAmount * 0.05); // 5% platform fee
    const totalAmountPaid = baseAmount + userPlatformFee;

    const newBill = new Bill({
      bookingId,
      userId: booking.user,
      helperId: booking.helper,
      totalHours,
      ratePerHour,
      description,
      baseAmount,
      userPlatformFee,
      totalAmountPaid,
      paymentMode,
      paymentId,
      paymentStatus: paymentId ? "Paid" : "Pending"
    });

    await newBill.save();
      booking.status = "Completed";
    await booking.save();
    res.status(201).json({ message: "Bill created", bill: newBill });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Server error" });
  }
};





// Get bill for a given booking ID
export const getBillByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const bill = await Bill.findOne({ bookingId });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found for this booking" });
    }

    res.status(200).json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Server error" });
  }
};



//all bills of user
// Get all bills for the logged-in user
export const getAllBillsForUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bills = await Bill.find({ userId });

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching user bills:", error);
    res.status(500).json({ error: "Server error" });
  }
};
