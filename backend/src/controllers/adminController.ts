import { Response } from 'express';
import Dog from '../models/Dog';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getPendingDogs = async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await Dog.find({ status: 'pending' })
      .populate('owner', 'firstName lastName email')
      .sort('-createdAt');

    res.json({ success: true, dogs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await Dog.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    res.json({ success: true, dog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDog = async (req: AuthRequest, res: Response) => {
  try {
    const dog = await Dog.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found' });
    }

    res.json({ success: true, dog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDogs = await Dog.countDocuments();
    const activeDogs = await Dog.countDocuments({ status: 'active' });
    const pendingDogs = await Dog.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDogs,
        activeDogs,
        pendingDogs
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};