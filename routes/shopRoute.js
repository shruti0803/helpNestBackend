import express from "express";
import { addMedicine, addToCart, buyMedicine, getAllMedicines, getCart, getMedicineById, removeFromCart } from "../controllers/shopController.js";
import isAuthenticated from "../middleware/authMiddleware.js";

// import { protectAdmin } from "../middleware/authMiddleware.js"; // Optional if auth is used

const router = express.Router();

// Public routes
router.get("/", getAllMedicines);


// Protected route to add (assume only admin adds meds)
// router.post("/", protectAdmin, addMedicine);
router.post("/", addMedicine); // Temporarily public for testing
router.post('/add', isAuthenticated, addToCart);
router.post('/remove', isAuthenticated, removeFromCart);
router.get('/getCart', isAuthenticated, getCart);

router.post('/checkout', isAuthenticated, buyMedicine);

router.get("/:id", getMedicineById);
export default router;
