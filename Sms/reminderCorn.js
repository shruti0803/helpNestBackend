import cron from 'node-cron';
import moment from 'moment';
import dotenv from 'dotenv';
dotenv.config();

import sendSMS from './sendSms.js';
import MedicineSchedule from '../models/health.model.js';
import AppointmentSchedule from '../models/appointment.model.js';

// Convert current hour to "morning" / "afternoon" / "evening" / "night"
function getTimeOfDay(hour) {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}

//for 1 min 
// cron.schedule('*/1 * * * *', async () => {
    //for three hours
cron.schedule('0 */3 * * *', async () => {

  const now = moment();
  const startOfDay = moment().startOf('day').toDate();
  const endOfDay = moment().endOf('day').toDate();
  const timeOfDay = getTimeOfDay(now.hour());

  try {
    // 🔍 Find all medicine schedules matching today's date and current time slot
    const meds = await MedicineSchedule.find({
      reminder: true,
      schedule: {
        $elemMatch: {
          date: { $gte: startOfDay, $lte: endOfDay },
          timeSlot: timeOfDay
        }
      }
    });

    console.log(`🩺 Found ${meds.length} medicine(s) for ${now.format('YYYY-MM-DD')} at ${timeOfDay}`);

    for (let med of meds) {
      const matchingEntry = med.schedule.find(entry =>
        moment(entry.date).isBetween(startOfDay, endOfDay, null, '[]') &&
        entry.timeSlot === timeOfDay
      );

      if (matchingEntry) {
        console.log(`📤 Sending medicine reminder to ${med.phone} for "${med.name}"`);
      await sendSMS(
  med.phone, // ✅ already has +91
  `⏰ Reminder: Take your medicine "${med.name}" this ${timeOfDay}.`
);

      }
    }

    // 🔍 Find all appointment schedules matching today + time slot
    const appts = await AppointmentSchedule.find({
      reminder: true,
      schedule: {
        $elemMatch: {
          date: { $gte: startOfDay, $lte: endOfDay },
          timeSlot: timeOfDay
        }
      }
    });

    console.log(`📅 Found ${appts.length} appointment(s) for ${now.format('YYYY-MM-DD')} at ${timeOfDay}`);

    for (let appt of appts) {
      const matchingEntry = appt.schedule.find(entry =>
        moment(entry.date).isBetween(startOfDay, endOfDay, null, '[]') &&
        entry.timeSlot === timeOfDay
      );

      if (matchingEntry) {
        console.log(`📤 Sending appointment reminder to ${appt.phone} for "${appt.title}"`);
       await sendSMS(
  appt.phone, // ✅ already has +91
  `📅 Reminder: You have an appointment "${appt.title}" this ${timeOfDay}.`
);


      }
    }

    console.log(`[✔] SMS reminders sent for ${timeOfDay} at ${now.format('HH:mm')}`);
  } catch (err) {
    console.error('[❌] Error sending SMS reminders:', err.message);
  }
});
