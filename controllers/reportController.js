// controllers/report.controller.js

import Report from '../models/report.model.js';
import Booking from '../models/booking.model.js';
import Helper from '../models/helper.model.js';

export const createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, reason, details } = req.body;

    console.log("User ID:", userId);
    console.log("Incoming body:", req.body);

    if (!bookingId || !reason) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existingBooking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!existingBooking) {
      return res.status(403).json({ message: 'Invalid or unauthorized booking.' });
    }

    const reportedHelper = existingBooking.helper;

    // ✅ Fix here
    const alreadyReported = await Report.findOne({ booking: bookingId });
    if (alreadyReported) {
      return res.status(409).json({ message: 'A report has already been filed for this booking.' });
    }

    // ✅ Use "booking", not "bookingId"
    const report = new Report({
      booking: bookingId,
      reporter: userId,
      reportedHelper,
      reason,
      details,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully.', report });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const getReportsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.find({ reporter: userId }).select("booking reason details")

  .lean(); 

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

