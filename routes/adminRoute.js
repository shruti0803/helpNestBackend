import express from "express";
import { adminLogin, adminLogout, getAdminProfile, getDailyBookings, getEarningByMonth, getHelperSummary, getUserSummary } from "../controllers/adminController.js";
import isAdminAuthenticated from "../middleware/isAdminMiddleware.js";



const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Admin logout
router.post("/logout", adminLogout);

// Get admin profile (protected)
router.get("/profile", isAdminAuthenticated, getAdminProfile);
router.get("/earnings/:month",getEarningByMonth);
router.get('/bookings-by-date', getDailyBookings);
router.get('/users/summary', getUserSummary);
router.get('/helpers/summary',getHelperSummary);
export default router;
