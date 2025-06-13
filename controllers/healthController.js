import Health from "../models/health.model.js";



/**
 * POST /api/health/daily
 * Creates (or returns) today's health log.
 * • Uses the latest saved medicine schedule in Health collection itself.
 * • Resets `taken` to false.
 * • Does NOT rely on User model or change middleware.
 */
export const createDailyHealth = async (req, res) => {
  try {
    // 1️⃣ Resolve user ID no matter what the middleware set.
    const userId = req.user.id || req.user._id;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    // 2️⃣ Get today's date stripped to midnight.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3️⃣ If today's log already exists, just return it.
    const existing = await Health.findOne({ user: userId, date: today });
    if (existing) return res.status(200).json(existing);

    // 4️⃣ Find the most recent log that HAS medicines.
    const lastLog = await Health.findOne({
      user: userId,
      "medicine.0": { $exists: true },
    })
      .sort({ date: -1 })
      .lean();

    const schedule = lastLog?.medicine || [];

    // 5️⃣ Keep only medicines scheduled for TODAY (Mon, Tue…).
    const weekday = today.toLocaleString("en-US", { weekday: "short" }); // e.g. "Mon"
    const medsForToday = schedule
      .filter((m) => m.days.includes(weekday))
      .map((m) => ({
        name: m.name,
        time: m.time,
        days: m.days,
        taken: false,
      }));

    // 6️⃣ Create the new daily log.
    const todayLog = await Health.create({
      user: userId,
      date: today,
      medicine: medsForToday,
      // other fields will fall back to defaults in the schema
      // leaving out `exercise` avoids the cast-to-string error
    });

    return res.status(201).json(todayLog);
  } catch (err) {
    console.error("Error creating daily health log:", err);
    return res.status(500).json({ error: "Server error" });
  }
};






// export const updateDailyHealth = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user._id;
//     const { date, medicine, waterIntake, sleep, exercise } = req.body;

//     if (!date) {
//       return res.status(400).json({ error: "Date is required" });
//     }

//     const targetDate = new Date(date);
//     targetDate.setHours(0, 0, 0, 0);

//     // Prepare update object dynamically
//     const updateObj = {};

//     if (medicine) {
//       updateObj.medicine = medicine.map((m) => ({
//         name: m.name,
//         time: m.time,
//         days: m.days,
//         taken: false,
//       }));
//     }

//     if (waterIntake) updateObj.waterIntake = waterIntake;
//     if (sleep) updateObj.sleep = sleep;
//     if (exercise) updateObj.exercise = exercise;

//     const updated = await Health.findOneAndUpdate(
//       { user: userId, date: targetDate },
//       { $set: updateObj },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ error: "Health log not found for that date" });
//     }

//     return res.json(updated);
//   } catch (err) {
//     console.error("Error updating health log:", err.message);
//     return res.status(500).json({ error: "Server error" });
//   }
// };





// add medicine 
export const addMedicine = async (req, res) => {
  const userId = req.user.id;
  const { name, time, days } = req.body;

  const today = new Date().toISOString().split("T")[0];

  let health = await Health.findOne({ user: userId, date: today });
  if (!health) health = new Health({ user: userId, date: today });

  health.medicine.push({ name, time, days, taken: false });
  await health.save();

  res.json(health.medicine);
};


//add appointment
export const addAppointment = async (req, res) => {
  const userId = req.user.id;
  const { title, day, time } = req.body;

  const today = new Date().toISOString().split("T")[0];

  let health = await Health.findOne({ user: userId, date: today });
  if (!health) health = new Health({ user: userId, date: today });

  health.appointments.push({ title, day, time, done: false });
  await health.save();

  res.json(health.appointments);
};


//fetch for today 
export const getTodayData = async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Fri"

  // Get all health entries for the user
  const allHealth = await Health.find({ user: userId });

  // Collect today's medicines and appointments from all entries
  const todayMedicines = [];
  const todayAppointments = [];

  allHealth.forEach(entry => {
    entry.medicine?.forEach(med => {
      if (med.days.includes(weekday)) {
        todayMedicines.push(med);
      }
    });

    entry.appointments?.forEach(app => {
      if (app.day === weekday) {
        todayAppointments.push(app);
      }
    });
  });

  res.json({ medicine: todayMedicines, appointments: todayAppointments });
};



//mark medicine as taken 
export const markMedicineTaken = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;
  const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Fri"

  // Find the document that contains the medicine with the matching name and weekday
  const healthDocs = await Health.find({ user: userId });

  let updated = false;
  let updatedDoc;

  for (const doc of healthDocs) {
    const medIndex = doc.medicine.findIndex(
      m => m.name === name && m.days.includes(todayWeekday)
    );

    if (medIndex !== -1) {
      doc.medicine[medIndex].taken = true;
      updatedDoc = await doc.save();
      updated = true;
      break;
    }
  }

  if (updated) {
    res.json(updatedDoc.medicine);
  } else {
    res.status(404).json({ message: "Medicine not found for today." });
  }
};



//mark appointment as done
export const markAppointmentDone = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;
  const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "short" });

  const healthDocs = await Health.find({ user: userId });

  let updated = false;
  let updatedDoc;

  for (const doc of healthDocs) {
    const appIndex = doc.appointments.findIndex(
      a => a.title === title && a.day === todayWeekday
    );

    if (appIndex !== -1) {
      doc.appointments[appIndex].done = true;
      updatedDoc = await doc.save();
      updated = true;
      break;
    }
  }

  if (updated) {
    res.json(updatedDoc.appointments);
  } else {
    res.status(404).json({ message: "Appointment not found for today." });
  }
};



//delete appointment or medicine
export const deleteMedicine = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.params;
  const today = new Date().toISOString().split("T")[0];

  const updated = await Health.findOneAndUpdate(
    { user: userId, date: today },
    { $pull: { medicine: { name } } },
    { new: true }
  );

  res.json(updated?.medicine);
};

export const deleteAppointment = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.params;
  const today = new Date().toISOString().split("T")[0];

  const updated = await Health.findOneAndUpdate(
    { user: userId, date: today },
    { $pull: { appointments: { title } } },
    { new: true }
  );

  res.json(updated?.appointments);
};








export const getWeeklyHealthSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekMap = {
      Mon: { medicines: [], appointments: [] },
      Tue: { medicines: [], appointments: [] },
      Wed: { medicines: [], appointments: [] },
      Thu: { medicines: [], appointments: [] },
      Fri: { medicines: [], appointments: [] },
      Sat: { medicines: [], appointments: [] },
      Sun: { medicines: [], appointments: [] },
    };

    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // ✅ Step 1: Fetch logs within the date range
    const logs = await Health.find({
      user: userId,
      date: { $gte: monday, $lte: sunday },
    });

    // ✅ Step 2: Append logs to the appropriate days
    logs.forEach((log) => {
      // Push each medicine to its respective days
      if (log.medicine?.length) {
        log.medicine.forEach((med) => {
          med.days.forEach((day) => {
            if (weekMap[day]) {
              weekMap[day].medicines.push({
                name: med.name,
                time: med.time,
                days: med.days,
                taken: med.taken ?? false,
              });
            }
          });
        });
      }

      // Push each appointment to the correct day
      if (log.appointments?.length) {
        log.appointments.forEach((app) => {
          const appDay = app.day;
          if (weekMap[appDay]) {
            weekMap[appDay].appointments.push({
              title: app.title,
              time: app.time,
              done: app.done ?? false,
              day: app.day,
            });
          }
        });
      }
    });

    // ✅ Step 3: Backfill medicines from latestHealth if missing
    const latestHealth = await Health.findOne({ user: userId }).sort({ date: -1 });

    if (latestHealth) {
      const allMedicines = latestHealth.medicine;

      Object.keys(weekMap).forEach((day) => {
        if (weekMap[day].medicines.length === 0) {
          const medsForDay = allMedicines
            .filter((med) => med.days.includes(day))
            .map((med) => ({
              name: med.name,
              time: med.time,
              days: med.days,
              taken: false,
            }));
          weekMap[day].medicines = medsForDay;
        }
      });
    }

    res.status(200).json(weekMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch weekly summary" });
  }
};




