import express from "express";
import { addMedicine, addToCart, buyMedicine, confirmMedicinePayment, getAllMedicines, getCart, getMedicineById, getUserOrders, removeFromCart, updateStock, uploadPrescription } from "../controllers/shopController.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import multer from 'multer';
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
router.put('/:id/stock', updateStock);
router.post('/checkout', isAuthenticated, buyMedicine);



const storage = multer.diskStorage({
  destination: (req, file, cb) =>{ console.log("📦 Saving to 'uploads/'");
     cb(null, 'uploads/')},
  filename: (req, file, cb) =>{
     console.log("📝 Incoming file:", file.originalname);
   cb(null, `${Date.now()}-${file.originalname}`)},
});

const upload = multer({ storage });

router.post('/upload-prescription', isAuthenticated, upload.single('prescription'), uploadPrescription);


// ✅ Confirm Razorpay payment after success
router.post('/confirm-payment', isAuthenticated, confirmMedicinePayment);
router.get("/:id", getMedicineById);
router.get('/orders/user', isAuthenticated, getUserOrders);
export default router;
