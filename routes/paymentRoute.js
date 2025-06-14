import express from "express";
import { createPaymentOrder, updatePaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.put("/update-payment", updatePaymentStatus);

export default router;
