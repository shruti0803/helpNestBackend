import express from "express";
import { addMedicine, getMedsForDate, markMedicineTaken } from "../controllers/healthController.js"
import isAuthenticated from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/addMed",isAuthenticated, addMedicine);
router.get("/meds-for-date", isAuthenticated, getMedsForDate);
router.patch("/markTaken", isAuthenticated, markMedicineTaken);


export default router;
