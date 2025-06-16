import express from "express";
import  {createBill, getAllBillsForUser, getBillByBookingId}  from "../controllers/billController.js";
import isAuthenticated from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createbill", isAuthenticated, createBill);
router.get("/getbill/:bookingId", getBillByBookingId);
router.get("/allBills", isAuthenticated, getAllBillsForUser);

export default router;
