// routes/userRoutes.js
import express from 'express';
import { getMyProfile,    Logout, registerUser,  userLogin } from '../controllers/userController.js';

import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', userLogin);
router.get('/logout', Logout);

router.get('/profile', isAuthenticated, getMyProfile);


// router.get('/training/progress', isAuthenticated, getTrainingProgress);
// router.post('/training/progress', isAuthenticated, updateTrainingProgress);

// router.get('/test-score', isAuthenticated, getTestScore);
// router.post('/test-score', isAuthenticated, updateTestScore);
export default router;
