import express from "express";
import { createPaymentOrder, getHelperSalary, updatePaymentStatus } from "../controllers/paymentController.js";
import isHelperAuthenticated from "../middleware/isHelperMiddleware.js";

const router = express.Router();

router.post("/create-order", createPaymentOrder);
router.put("/update-payment", updatePaymentStatus);
router.get("/getSalary", isHelperAuthenticated, getHelperSalary);
export default router;
