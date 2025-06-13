import express from "express";
import { createBooking, getAllRequestsByUser, getAvailableTasks, getScheduledBookings, markBookingCompletedByUser, scheduleBooking } from "../controllers/bookingController.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import isHelperAuthenticated from "../middleware/isHelperMiddleware.js";
const router = express.Router();

router.post("/", isAuthenticated, createBooking);
// routes/requestRoutes.js
router.get('/requests', isAuthenticated, getAllRequestsByUser);

router.get('/tasks', isHelperAuthenticated, getAvailableTasks);
router.put('/schedule',isHelperAuthenticated, scheduleBooking);
router.get('/scheduled', isHelperAuthenticated, getScheduledBookings);

router.put('/mark-completed', isAuthenticated, markBookingCompletedByUser);
export default router;
