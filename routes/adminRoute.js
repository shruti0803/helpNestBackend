import express from "express";
import { adminLogin, adminLogout, getAdminProfile, getAllBills, getAllHelpers, getAllUsers, getBookingCount, getBookingsByCategory, getBookingsByCity, getDailyBookings, getEarningByMonth, getHelperSummary, getOrdersPerWeek, getOverallRatingStats, getPendingSalaries, getShopProductCount, getUnverifiedPrescriptions, getUserSummary, paySalary, verifyHelper, verifyPrescription } from "../controllers/adminController.js";
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
router.get('/bookings-by-category', getBookingsByCategory);
router.get('/bookings-by-city',getBookingsByCity);
router.get("/allUsers", getAllUsers);
router.get('/allHelpers', getAllHelpers);
router.get('/allBills', getAllBills);
router.patch('/verify/:id', verifyHelper);
router.get('/allsalaries', getPendingSalaries);
router.post('/pay-salary', paySalary);
router.get('/ratings-summary', getOverallRatingStats);
router.get("/product-count", getShopProductCount);
router.get("/booking-count", getBookingCount);
router.get('/orders-per-week', getOrdersPerWeek);
router.get('/unverified-prescriptions',isAdminAuthenticated, getUnverifiedPrescriptions);
router.post('/verify-prescription/:id', isAdminAuthenticated,verifyPrescription);

export default router;
