import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getPendingDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, dogs });
  } catch (error: any) {
    console.error('Get pending dogs error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const approveDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.update({
      where: { id: req.params.id as string },
      data: { status: 'ACTIVE' },
    });

    res.json({ success: true, dog });
  } catch (error: any) {
    console.error('Approve dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const rejectDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await prisma.dog.update({
      where: { id: req.params.id as string },
      data: { status: 'INACTIVE' },
    });

    res.json({ success: true, dog });
  } catch (error: any) {
    console.error('Reject dog error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        verified: true,
        city: true,
        county: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDogs = await prisma.dog.count();
    const activeDogs = await prisma.dog.count({ where: { status: 'ACTIVE' } });
    const pendingDogs = await prisma.dog.count({ where: { status: 'PENDING' } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDogs,
        activeDogs,
        pendingDogs,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message });
  }
};