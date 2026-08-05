import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { Status } from '@prisma/client';
import logger from '../utils/logger';

// Toggle: save if not saved, unsave if saved. One endpoint keeps the client
// trivial and makes double-clicks self-correcting. The Dog.favorites counter
// is updated in the same transaction so it can never drift.
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const dogId = req.params.dogId as string;
    const userId = req.user!.id;

    if (!dogId || Array.isArray(dogId)) {
      return res.status(400).json({ success: false, message: 'Invalid dog ID' });
    }

    const dog = await prisma.dog.findUnique({
      where: { id: dogId },
      select: { id: true, status: true },
    });

    if (!dog || dog.status !== Status.ACTIVE) {
      return res.status(404).json({ success: false, message: 'Dog not found' });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_dogId: { userId, dogId } },
    });

    if (existing) {
      const [, updatedDog] = await prisma.$transaction([
        prisma.favorite.delete({ where: { id: existing.id } }),
        prisma.dog.update({
          where: { id: dogId },
          data: { favorites: { decrement: 1 } },
          select: { favorites: true },
        }),
      ]);
      return res.json({ success: true, favorited: false, count: Math.max(0, updatedDog.favorites) });
    }

    const [, updatedDog] = await prisma.$transaction([
      prisma.favorite.create({ data: { userId, dogId } }),
      prisma.dog.update({
        where: { id: dogId },
        data: { favorites: { increment: 1 } },
        select: { favorites: true },
      }),
    ]);
    res.json({ success: true, favorited: true, count: updatedDog.favorites });
  } catch (error) {
    logger.error({ err: error }, 'Toggle favorite error');
    res.status(500).json({ success: false, message: 'Failed to update favourite' });
  }
};

// Card-shaped list of the user's saved dogs, newest save first
export const getMyFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        dog: {
          select: {
            id: true,
            name: true,
            breed: true,
            gender: true,
            dateOfBirth: true,
            age: true,
            weight: true,
            images: true,
            mainImage: true,
            available: true,
            studFee: true,
            status: true,
            city: true,
            county: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                city: true,
                county: true,
              },
            },
          },
        },
      },
    });

    // Saved dogs that have since been rejected/deactivated are filtered out
    // rather than shown as dead cards
    const dogs = favorites
      .filter((f) => f.dog.status === Status.ACTIVE)
      .map((f) => f.dog);

    res.json({ success: true, dogs, total: dogs.length });
  } catch (error) {
    logger.error({ err: error }, 'Get favorites error');
    res.status(500).json({ success: false, message: 'Failed to fetch favourites' });
  }
};

// Just the dog IDs — the client uses this to render heart states on any list
// without shipping full dog rows twice
export const getMyFavoriteIds = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      select: { dogId: true },
    });

    res.json({ success: true, ids: favorites.map((f) => f.dogId) });
  } catch (error) {
    logger.error({ err: error }, 'Get favorite ids error');
    res.status(500).json({ success: false, message: 'Failed to fetch favourites' });
  }
};
