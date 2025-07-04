// routes/review.routes.js
import express from 'express';
import { createReview, getHelperRating, getReviewsByService, getServiceRating } from '../controllers/reviewController.js';


import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', isAuthenticated, createReview);
// Get average rating for a helper (GET)
router.get('/helper/:helperId', getHelperRating);

// Get average rating for a service (GET)
router.get('/service/:serviceName',getServiceRating)
router.get('/serviceReview/:serviceName', getReviewsByService)
export default router;
