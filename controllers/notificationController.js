import Notification from "../models/notification.model.js";

// Get all seen notifications for user/helper
export const getNotifications = async (req, res) => {
  try {
    let query;

    // 🟣 Corrected logic to support both user and helper
    if (req.helper) {
      query = { helper: req.helper.id };
    } else if (req.user) {
      query = { user: req.user.id };
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await Notification.find(query).sort({ seenAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark new notifications as seen (store them in DB)
export const markNotificationsAsSeen = async (req, res) => {
  try {
    const { type, ids } = req.body;

    if (!type || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Type and ids are required' });
    }

    const isHelper = !!req.helper;
    const actorId = isHelper ? req.helper.id : req.user.id;

    // 1. Get already seen
    const existing = await Notification.find({
      type,
      refId: { $in: ids },
      ...(isHelper ? { helper: actorId } : { user: actorId })
    });

    const seenSet = new Set(existing.map(n => n.refId.toString()));

    // 2. Filter and insert new
    const newNotifications = ids
      .filter(id => !seenSet.has(id))
      .map(id => ({
        type,
        refId: id,
        seenAt: new Date(),
        ...(isHelper ? { helper: actorId } : { user: actorId })
      }));

    if (newNotifications.length > 0) {
      await Notification.insertMany(newNotifications, { ordered: false }).catch(() => {});
    }

    res.json({ message: 'Marked as seen' });

  } catch (err) {
    console.error("❌ Error marking notifications as seen:", err);
    res.status(500).json({ error: 'Failed to mark notifications as seen' });
  }
};


