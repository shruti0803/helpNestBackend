// routes/userRoutes.js
import express from 'express';
import { addEmergencyNumber, getMyProfile,    Logout, registerUser,  sendEmergencyMessage,  userLogin } from '../controllers/userController.js';

import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', userLogin);
router.get('/logout',isAuthenticated, Logout);

router.get('/profile', isAuthenticated, getMyProfile);
router.put('/emergency-number', isAuthenticated, addEmergencyNumber);

router.post('/send-emergency-alert', isAuthenticated, sendEmergencyMessage);
export default router;
