import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { dogId, rating, comment } = req.body;

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        dogId_reviewerId: {
          dogId,
          reviewerId: req.user!.id,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this dog' });
    }

    const review = await prisma.review.create({
      data: {
        dogId,
        reviewerId: req.user!.id,
        rating: parseInt(rating),
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, review });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDogReviews = async (req: AuthRequest, res: Response) => {
  try {
    const dogId = Array.isArray(req.params.dogId) ? req.params.dogId[0] : req.params.dogId;

    const reviews = await prisma.review.findMany({
      where: { dogId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total: reviews.length,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Get dog reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};