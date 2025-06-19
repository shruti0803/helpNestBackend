import express from "express";
import { adminLogin, adminLogout, getAdminProfile } from "../controllers/adminController.js";
import isAdminAuthenticated from "../middleware/isAdminMiddleware.js";



const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Admin logout
router.post("/logout", adminLogout);

// Get admin profile (protected)
router.get("/profile", isAdminAuthenticated, getAdminProfile);

export default router;
