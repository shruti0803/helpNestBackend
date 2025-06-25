// GET /api/notifications
import Notification from '../models/notification.model.js'
export const getHelperNotifications = async (req, res) => {
  const helperId = req.helper.id;
console.log("Helper in request:", req.helper); // 👈 check this
  try {
    const notifications = await Notification.find({ recipient: helperId }).sort({ createdAt: -1 });
    
    res.json({ notifications });
  } catch (err) {
    console.error("🔴 Notification fetch error:", err); // Add this
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
