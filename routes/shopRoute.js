import express from "express";
import { addMedicine, getAllMedicines, getMedicineById } from "../controllers/shopController.js";

// import { protectAdmin } from "../middleware/authMiddleware.js"; // Optional if auth is used

const router = express.Router();

// Public routes
router.get("/", getAllMedicines);
router.get("/:id", getMedicineById);

// Protected route to add (assume only admin adds meds)
// router.post("/", protectAdmin, addMedicine);
router.post("/", addMedicine); // Temporarily public for testing

export default router;
