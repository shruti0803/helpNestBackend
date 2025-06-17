import MedicineSchedule from "../models/health.model.js";

// POST /api/medicine/add
export const addMedicine = async (req, res) => {
  try {
    const {
      name,
      type,
      dosage,
      notes,
      reminder,
      schedule // array of { date, timeSlot }
    } = req.body;

    const userId = req.user.id; // comes from auth middleware

    if (!name || !type || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Format schedule
    const formattedSchedule = schedule.map(entry => ({
      date: new Date(entry.date),
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

    const targetDate = dateQuery ? new Date(dateQuery) : new Date();
    const targetDayStr = targetDate.toISOString().split("T")[0];

    console.log("🎯 Target Day:", targetDayStr); // e.g., 2025-06-17

    const meds = await MedicineSchedule.find({ userId });
    const tasks = [];

    meds.forEach((med) => {
      med.schedule.forEach((entry) => {
        const entryDayStr = new Date(entry.date).toISOString().split("T")[0];

        console.log(
          "📅 Checking:",
          entry.name || med.name,
          "| Entry Date:",
          entryDayStr,
          "| Matches Target?",
          entryDayStr === targetDayStr
        );

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

    console.log("✅ Final tasks:", tasks);
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

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

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
