import express from "express";
import { cancelBooking, checkHelperArrival, createBooking, getAllRequestsByUser, getAvailableTasks, getCompletedBookings, getScheduledBookings, markBookingCompletedByUser, scheduleBooking, updateHelperLocation, verifyOtp } from "../controllers/bookingController.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import isHelperAuthenticated from "../middleware/isHelperMiddleware.js";
const router = express.Router();

router.post("/", isAuthenticated, createBooking);
// routes/requestRoutes.js
router.get('/requests', isAuthenticated, getAllRequestsByUser);

router.get('/tasks', isHelperAuthenticated, getAvailableTasks);
router.put('/schedule',isHelperAuthenticated, scheduleBooking);
router.get('/scheduled', isHelperAuthenticated, getScheduledBookings);
router.get('/completed', isHelperAuthenticated, getCompletedBookings);
router.put('/mark-completed', isAuthenticated, markBookingCompletedByUser);
router.put('/verify-otp', verifyOtp);
router.put("/update-helper-location/:bookingId", isHelperAuthenticated, updateHelperLocation);
// routes/bookings.js
router.post('/check-arrival/:id', isHelperAuthenticated, checkHelperArrival);
router.delete("/:bookingId", isAuthenticated, cancelBooking);

export default router;
