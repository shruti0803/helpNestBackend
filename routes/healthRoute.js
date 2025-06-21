import express from "express";
import { addAppointment, addMedicine, getAppointmentsForDate, getMedsForDate, getStreak, markAppointmentDone, markMedicineTaken } from "../controllers/healthController.js"
import isAuthenticated from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/addMed",isAuthenticated, addMedicine);
router.get("/meds-for-date", isAuthenticated, getMedsForDate);
router.patch("/markTaken", isAuthenticated, markMedicineTaken);

router.post("/addAppt", isAuthenticated,addAppointment);
router.get("/appts-for-date", isAuthenticated, getAppointmentsForDate);
router.patch("/markDone", isAuthenticated, markAppointmentDone);
// in routes/health.js
router.get("/streak", isAuthenticated, getStreak);

export default router;
