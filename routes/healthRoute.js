import express from "express";
import isAuthenticated from "../middleware/authMiddleware.js";
import { addAppointment, addMedicine,  deleteAppointment, deleteMedicine, getTodayData, getWeeklyHealthSummary, markAppointmentDone, markMedicineTaken } from "../controllers/healthController.js";
const router=express.Router();
// router.get('/daily', isAuthenticated, createDailyHealth);
// router.put("/update-daily", isAuthenticated, updateDailyHealth);



router.post("/medicine", isAuthenticated, addMedicine);
router.post("/appointment", isAuthenticated, addAppointment);
router.get("/today",isAuthenticated, getTodayData);
router.put("/medicine/taken",isAuthenticated, markMedicineTaken);
router.put("/appointment/done",isAuthenticated, markAppointmentDone);
router.delete("/medicine/:name", isAuthenticated, deleteMedicine);
router.delete("/appointment/:title",isAuthenticated, deleteAppointment);
router.get("/weekly-summary",isAuthenticated, getWeeklyHealthSummary);


export default router;