import express from 'express';
import {
  getNotifications,
  markNotificationsAsSeen
} from '../controllers/notificationController.js';
import isAuthenticated from '../middleware/authMiddleware.js';
import isHelperAuthenticated from '../middleware/isHelperMiddleware.js';



const router = express.Router();

// For user
router.get('/user', isAuthenticated, getNotifications);
router.post('/user/mark-seen', isAuthenticated, markNotificationsAsSeen);

// For helper
router.get('/helper', isHelperAuthenticated, getNotifications);
router.post('/helper/mark-seen', isHelperAuthenticated, markNotificationsAsSeen);

export default router;
