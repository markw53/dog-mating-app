import express from 'express';
import { createReview, getDogReviews } from '../controllers/reviewController';
import { protect } from '../middleware/auth';
import { validateReview, handleValidation } from '../middleware/validate';

const router = express.Router();

router.post('/', protect, validateReview, handleValidation, createReview);
router.get('/dog/:dogId', getDogReviews);

export default router;
