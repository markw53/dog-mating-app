import { Response } from 'express';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, rating, comment } = req.body;

    // Check if review already exists
    const existingReview = await Review.findOne({
      dog: dogId,
      reviewer: req.user!._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this dog' });
    }

    const review = await Review.create({
      dog: dogId,
      reviewer: req.user!._id,
      rating,
      comment
    });

    await review.populate('reviewer', 'firstName lastName avatar');

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDogReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId } = req.params;

    const reviews = await Review.find({ dog: dogId })
      .populate('reviewer', 'firstName lastName avatar')
      .sort('-createdAt');

    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};