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
      genderPreference, // 👈 new field
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

    const { city: helperCity, services: helperServices, gender: helperGender } = helper;

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
      status: "Scheduled", // ✅ optional safeguard: only allow marking scheduled ones
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not accessible" });
    }

    // Set isCompleted = true
    booking.isCompleted = true;
    await booking.save();

    res.status(200).json({
      message: "Booking marked as completed by user",
      booking,
    });
  } catch (error) {
    console.error("Error marking booking completed by user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



















