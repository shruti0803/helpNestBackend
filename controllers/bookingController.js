import Booking from "../models/booking.model.js";
import mongoose from "mongoose";
import Helper from '../models/helper.model.js';
import User from '../models/user.model.js'

export const createBooking = async (req, res) => {
  try {
    const {
      service,
      city,
      address,
      personName,
      phone,
      date,
      time,
      genderPreference,
      lat,        // ✅ added
      lng         // ✅ added
    } = req.body;

    const userId = req.user.id; // from JWT middleware

    const newBooking = new Booking({
      user: userId,
      service,
      city,
      address,
      personName,
      phone,
      date,
      time,
      genderPreference,
      lat,        // ✅ now included
      lng         // ✅ now included
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};




export const getAllRequestsByUser = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const requests = await Booking.find({ user: userObjectId }).populate('helper', 'name');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};





export const getAvailableTasks = async (req, res) => {
  try {
    const helperId = req.helper.id; // <-- use id, not _id

    if (!helperId) {
      return res.status(401).json({ message: "Unauthorized: Helper not logged in" });
    }

    // Fetch helper details
    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }
 if (!helper.isVerified) {
      return res.status(403).json({ message: "Only verified helpers can access tasks" });
    }
    const { city: helperCity, services: helperServices  } = helper;

    const bookings = await Booking.find({
      status: "Pending",
      city: helperCity,
      service: { $in: helperServices },
      // genderPreference: helperGender,
      helper: null,
    });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const scheduleBooking = async (req, res) => {
  const { bookingId } = req.body;
  const helperId = req.helper; // should be a string, not an object

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Booking already scheduled or taken" });
    }

    booking.status = "Scheduled";
    booking.helper = req.helper.id; // ✅ if req.helper = { id: '...' }


    await booking.save();


    res.status(200).json({ message: "Booking scheduled successfully", data: booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



//fetch scheduled booking for particular user 
export const getScheduledBookings = async (req, res) => {
  // ✅ Safely extract the helper's ObjectId string
  const helperId = req.helper?.id || req.helper; // support both { id: ... } and direct string

  try {
    const bookings = await Booking.find({
      helper: helperId,
      status: "Scheduled"
    });

    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message || err
    });
  }
};

export const getCompletedBookings = async (req, res) => {
  // ✅ Safely extract the helper's ObjectId string
  const helperId = req.helper?.id || req.helper; // support both { id: ... } and direct string

  try {
    const bookings = await Booking.find({
      helper: helperId,
      status: "Completed"
    });

    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message || err
    });
  }
};

export const markBookingCompletedByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: "Scheduled", // Only scheduled bookings
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not accessible" });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Set fields
    booking.isCompleted = true;
    booking.otp = otp;
    booking.otpGeneratedAt = new Date();

    await booking.save();

    res.status(200).json({
      message: "Booking marked as completed. Share this OTP with the helper.",
      otp,
    });
  } catch (error) {
    console.error("Error marking booking completed by user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// PUT /api/bookings/verify-otp
export const verifyOtp = async (req, res) => {
  const { bookingId, enteredOtp } = req.body;
  const booking = await Booking.findById(bookingId);
  
  if (!booking || booking.otp !== enteredOtp) {
    return res.status(400).json({ message: "OTP incorrect or booking not found" });
  }

  booking.otpVerified = true;
  await booking.save();

  res.status(200).json({ message: "OTP verified successfully" });
};



export const updateHelperLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { lat, lng } = req.body;

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { helperLat: lat, helperLng: lng },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Location updated", booking: updated });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Failed to update location" });
  }
};

export const checkHelperArrival = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.helperLat || !booking.helperLng || !booking.lat || !booking.lng) {
      return res.status(400).json({ message: "Incomplete location data" });
    }

    // Haversine formula to calculate distance (in meters)
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371000; // radius of Earth in meters

    const dLat = toRad(booking.helperLat - booking.lat);
    const dLon = toRad(booking.helperLng - booking.lng);
    const lat1 = toRad(booking.lat);
    const lat2 = toRad(booking.helperLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // If within 1 km
    if (distance < 1000) {
      booking.hasArrived = true;
      await booking.save();
      return res.json({ arrived: true });
    } else {
      return res.json({ arrived: false, distance });
    }
  } catch (err) {
    console.error("Arrival check failed", err);
    res.status(500).json({ message: "Server error" });
  }
};

















