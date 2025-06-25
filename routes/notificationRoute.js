// In routes/helperRoutes.js (or wherever your helper routes are defined)

import express from 'express';
import { getHelperNotifications } from '../controllers/notificationController.js';

import isHelperAuthenticated from '../middleware/isHelperMiddleware.js';

const router = express.Router();

router.get('/bookingnotifications', isHelperAuthenticated, getHelperNotifications);

export default router;
