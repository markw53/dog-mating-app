import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  avatar: true,
  verified: true,
  address: true,
  city: true,
  county: true,
  postcode: true,
  country: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { ...USER_SELECT, password: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;

    logger.info({ userId: user.id }, 'User logged in');

    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        country: 'UK',
      },
      select: USER_SELECT,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    logger.info({ userId: user.id }, 'User registered');

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    logger.error({ err: error }, 'Registration error');
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    logger.error({ err: error }, 'Get current user error');
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, address, city, county, postcode, country } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(county !== undefined && { county: county || null }),
        ...(postcode !== undefined && { postcode: postcode || null }),
        ...(country && { country }),
      },
      select: USER_SELECT,
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error({ err: error }, 'Update profile error');
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = await uploadToCloudinary(req.file.buffer, 'dogmate/avatars');

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarUrl },
      select: USER_SELECT,
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    logger.error({ err: error }, 'Upload avatar error');
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};
