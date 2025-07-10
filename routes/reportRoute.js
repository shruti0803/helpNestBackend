import express from 'express';


import isAuthenticated from '../middleware/authMiddleware.js';
import { createReport, getReportsByUser } from '../controllers/reportController.js';

const router = express.Router();

router.post('/create', isAuthenticated, createReport);
router.get('/by-user', isAuthenticated, getReportsByUser);
export default router;
