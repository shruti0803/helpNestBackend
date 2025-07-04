// controllers/review.controller.js
import Review from '../models/review.model.js';
import Booking from '../models/booking.model.js';
import mongoose from 'mongoose';
export const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user?.id; // ✅ Use what's already set in middleware

  try {
    // ✅ Populate both helper and user
    const booking = await Booking.findById(bookingId)
      .populate('helper')
      .populate('user');

    console.log('booking.user:', booking.user);
    console.log('req.user?.id:', userId);

    if (!booking || booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Cannot review this booking' });
    }

    // ✅ Compare booking.user._id with req.user.id
    if (!booking.user || booking.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }

    // ✅ Prevent duplicate review
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    // ✅ Save the review
    const review = new Review({
      booking: bookingId,
      reviewer: userId,
      helper: booking.helper._id,
      service: booking.service,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// controller
export const getHelperRating = async (req, res) => {
  const { helperId } = req.params;
  const result = await Review.aggregate([
    { $match: { helper: new mongoose.Types.ObjectId(helperId) } },
    {
      $group: {
        _id: '$helper',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  res.json(result[0] || { avgRating: 0, totalReviews: 0 });
};


// controller
export const getServiceRating = async (req, res) => {
  try {
    const { serviceName } = req.params;

    const result = await Review.aggregate([
      { $match: { service: { $regex: `^${serviceName}$`, $options: 'i' } } },
      {
        $group: {
          _id: '$service',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ avgRating: 0, totalReviews: 0 });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching service rating', error: err.message });
  }
};

export const getReviewsByService = async (req, res) => {
  try {
    const service = decodeURIComponent(req.params.serviceName); // ✅ Match the router param name

    console.log("Looking for service:", service);

    const reviews = await Review.find({
      service: { $regex: `^${service}$`, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name')
      .populate('helper', 'name');

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error in getReviewsByService:", err);
    res.status(500).json({ message: "Server error" });
  }
};



