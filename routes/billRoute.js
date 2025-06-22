import express from "express";
import  {createBill, getAllBillsForUser, getBillByBookingId}  from "../controllers/billController.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import isHelperAuthenticated from "../middleware/isHelperMiddleware.js";

const router = express.Router();

router.post("/createbill", isHelperAuthenticated, createBill);
router.get("/getbill/:bookingId", getBillByBookingId);
router.get("/allBills", isAuthenticated, getAllBillsForUser);

export default router;
