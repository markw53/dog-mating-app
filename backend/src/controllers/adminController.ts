import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const getPendingDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, dogs });
  } catch (error) {
    logger.error({ err: error }, 'Get pending dogs error');
    res.status(500).json({ success: false, message: 'Failed to fetch pending dogs' });
  }
};

export const approveDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.update({
      where: { id: req.params.id as string },
      data: { status: 'ACTIVE' },
    });

    res.json({ success: true, dog });
  } catch (error) {
    logger.error({ err: error }, 'Approve dog error');
    res.status(500).json({ success: false, message: 'Failed to approve dog' });
  }
};

export const rejectDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.update({
      where: { id: req.params.id as string },
      data: { status: 'INACTIVE' },
    });

    res.json({ success: true, dog });
  } catch (error) {
    logger.error({ err: error }, 'Reject dog error');
    res.status(500).json({ success: false, message: 'Failed to reject dog' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, avatar: true, verified: true,
        city: true, county: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error) {
    logger.error({ err: error }, 'Get all users error');
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalDogs, activeDogs, pendingDogs] = await Promise.all([
      prisma.user.count(),
      prisma.dog.count(),
      prisma.dog.count({ where: { status: 'ACTIVE' } }),
      prisma.dog.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({ success: true, stats: { totalUsers, totalDogs, activeDogs, pendingDogs } });
  } catch (error) {
    logger.error({ err: error }, 'Get stats error');
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
