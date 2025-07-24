import MedicineSchedule from "../models/health.model.js";
import AppointmentSchedule from "../models/appointment.model.js";
// POST /api/medicine/add
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const addMedicine = async (req, res) => { 
  try {
    const {
      name,
      type,
      dosage,
      notes,
      reminder,
      schedule, // array of { date, timeSlot }
      phone  // <-- get phone from request body if reminder is true
    } = req.body;

    const userId = req.user.id; // comes from auth middleware

    if (!name || !type || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // 🔐 If reminder is true, phone must be provided
    if (reminder && (!phone || phone.length < 10)) {
      return res.status(400).json({ message: "Phone number is required for reminders." });
    }

    // ✅ Fix phone format
    let formattedPhone = null;
    if (reminder) {
      formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    }

    // Format schedule
    const formattedSchedule = schedule.map(entry => ({
      date: normalizeDate(entry.date),
      timeSlot: entry.timeSlot,
      status: "missed"
    }));

    const newMedicine = new MedicineSchedule({
      userId,
      name,
      type,
      dosage,
      notes,
      reminder: reminder || false,
      phone: formattedPhone,  // ✅ always in +91 format
      schedule: formattedSchedule
    });

    const saved = await newMedicine.save();
    res.status(201).json({
      message: "Medicine schedule added successfully",
      data: saved
    });

  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





export const getMedsForDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateQuery = req.query.date;

    const targetDate = normalizeDate(dateQuery || new Date());
const targetDayStr = targetDate.toISOString().split("T")[0];

    //console.log("🎯 Target Day:", targetDayStr); // e.g., 2025-06-17

    const meds = await MedicineSchedule.find({ userId });
    const tasks = [];

    meds.forEach((med) => {
      med.schedule.forEach((entry) => {
        const entryDayStr = normalizeDate(entry.date).toISOString().split("T")[0];


      

        if (entryDayStr === targetDayStr) {
          tasks.push({
            _id: med._id,
            name: med.name,
            type: med.type,
            dosage: med.dosage,
            timeSlot: entry.timeSlot,
            status: entry.status,
            scheduleId: entry._id,
          });
        }
      });
    });

   // console.log("✅ Final tasks:", tasks);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error("❌ Error fetching medicines for date:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};








export const markMedicineTaken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, date, timeSlot } = req.body;

    if (!name || !date || !timeSlot) {
      return res.status(400).json({ message: "name, date and timeSlot are required" });
    }

    const targetDate = normalizeDate(date);


    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // Update the specific schedule entry
    const updated = await MedicineSchedule.findOneAndUpdate(
      {
        userId,
        name,
        schedule: {
          $elemMatch: {
            date: { $gte: targetDate, $lt: nextDay },
            timeSlot: timeSlot
          }
        }
      },
      {
        $set: {
          "schedule.$.status": "taken"
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Schedule not found for this medicine/time/date" });
    }

    res.status(200).json({ message: "Marked as taken successfully", data: updated });

  } catch (err) {
    console.error("Error marking medicine:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};






export const addAppointment = async (req, res) => {
  try {
    const {
      title,
      location,
      doctor,
      notes,
      reminder,
      schedule, // array of { date, timeSlot }
      phone // <-- get phone from body
    } = req.body;

    const userId = req.user.id;

    if (!title || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // 🔐 If reminder is true, phone must be provided
    if (reminder && (!phone || phone.length < 10)) {
      return res.status(400).json({ message: "Phone number is required for reminders." });
    }

    const formattedSchedule = schedule.map(entry => ({
      date: normalizeDate(entry.date),
      timeSlot: entry.timeSlot,
      status: "missed"
    }));

    const newAppointment = new AppointmentSchedule({
      userId,
      title,
      location,
      doctor,
      notes,
      reminder: reminder || false,
      phone: reminder ? phone : null, // only save if reminder is true
      schedule: formattedSchedule
    });

    const saved = await newAppointment.save();
    res.status(201).json({
      message: "Appointment schedule added successfully",
      data: saved
    });

  } catch (err) {
    console.error("Error adding appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getAppointmentsForDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateQuery = req.query.date;

    const targetDate = normalizeDate(dateQuery || new Date());
const targetDayStr = targetDate.toISOString().split("T")[0];


    const appointments = await AppointmentSchedule.find({ userId });
    const tasks = [];

    appointments.forEach((appt) => {
      appt.schedule.forEach((entry) => {
       const entryDayStr = normalizeDate(entry.date).toISOString().split("T")[0];


        if (entryDayStr === targetDayStr) {
          tasks.push({
            _id: appt._id,
            title: appt.title,
            doctor: appt.doctor,
            location: appt.location,
            timeSlot: entry.timeSlot,
            status: entry.status,
            scheduleId: entry._id,
          });
        }
      });
    });

    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Error fetching appointments for date:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const markAppointmentDone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, date, timeSlot } = req.body;

    if (!title || !date || !timeSlot) {
      return res.status(400).json({ message: "title, date and timeSlot are required" });
    }

    const targetDate = normalizeDate(date);


    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const updated = await AppointmentSchedule.findOneAndUpdate(
      {
        userId,
        title,
        schedule: {
          $elemMatch: {
            date: { $gte: targetDate, $lt: nextDay },
            timeSlot: timeSlot
          }
        }
      },
      {
        $set: {
          "schedule.$.status": "done"
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Schedule not found for this appointment/time/date" });
    }

    res.status(200).json({ message: "Marked as done successfully", data: updated });

  } catch (err) {
    console.error("Error marking appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





import { format, subDays, isSameDay } from "date-fns";



import axios from "axios";






export const getStreak = async (req, res) => {
  try {
    const cookie = req.headers.cookie;
    let streak = 0;
    let currentDate = subDays(new Date(), 1); // ⏳ Start from yesterday
    const MAX_LOOKBACK_DAYS = 30;
    let checkedDays = 0;

    while (checkedDays < MAX_LOOKBACK_DAYS) {
      const dateStr = format(currentDate, "yyyy-MM-dd");

      const [medRes, apptRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/health/meds-for-date?date=${dateStr}`, {
          headers: { Cookie: cookie },
        }),
        axios.get(`http://localhost:5000/api/health/appts-for-date?date=${dateStr}`, {
          headers: { Cookie: cookie },
        }),
      ]);

      const meds = medRes.data.tasks || [];
      const appts = apptRes.data.tasks || [];

      const totalTasks = meds.length + appts.length;

      if (totalTasks === 0) {
        currentDate = subDays(currentDate, 1);
        checkedDays++;
        continue;
      }

      const allDone = [...meds, ...appts].every(
        (task) => task.status === "done" || task.status === "taken"
      );

      if (!allDone) break;

      streak++;
      currentDate = subDays(currentDate, 1);
      checkedDays++;
    }

    return res.status(200).json({ streak });
  } catch (err) {
    console.error("Error calculating streak:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};




import BloodPressure from "../models/bp.model.js";

export const addBpEntry = async (req, res) => {
  try {
    const { systolic, diastolic, date } = req.body;
    const userId = req.user?.id;

    if (!systolic || !diastolic || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const formattedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

    const existing = await BloodPressure.findOne({
      user: userId,
      date: formattedDate,
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "BP entry already exists for today." });
    }

    const entry = await BloodPressure.create({
      user: userId,
      date: formattedDate,
      systolic,
      diastolic,
    });

    res.status(201).json({ message: "BP entry added successfully", entry });
  } catch (err) {
    console.error("❌ Failed to add BP entry", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getBpByDate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const isoDate = new Date(date);
    const nextDay = new Date(isoDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bpRecord = await BloodPressure.findOne({
      user: userId,
      date: {
        $gte: isoDate,
        $lt: nextDay,
      },
    });

    if (!bpRecord) {
      return res.status(404).json({ message: "No BP record for this date" });
    }

    return res.status(200).json(bpRecord);
  } catch (err) {
    console.error("Error fetching BP record:", err);
    return res.status(500).json({ error: "Server error" });
  }
};