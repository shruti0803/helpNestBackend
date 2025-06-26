// routes/userRoutes.js
import express from 'express';
import { getMyProfile,    Logout, registerUser,  userLogin } from '../controllers/userController.js';

import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', userLogin);
router.get('/logout',isAuthenticated, Logout);

router.get('/profile', isAuthenticated, getMyProfile);



export default router;
