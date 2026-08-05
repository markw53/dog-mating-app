import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { notifyAdmin, sendEmail } from '../utils/notify';

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
    notifyAdmin('New user registered', `${user.firstName} ${user.lastName} (${user.email})`);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    logger.error({ err: error }, 'Registration error');
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashResetToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const forgotPassword = async (req: Request, res: Response) => {
  // Always the same response whether or not the email exists — anything else
  // lets attackers probe which addresses are registered
  const genericResponse = {
    success: true,
    message: 'If that email is registered, a reset link has been sent',
  };

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      return res.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString('hex');

    // One live token per user: issuing a new link invalidates older ones
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: {
          tokenHash: hashResetToken(token),
          userId: user.id,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      }),
    ]);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const sent = await sendEmail(
      user.email,
      'Reset your password',
      `Hi ${user.firstName},\n\n` +
        `Someone requested a password reset for your DogMate account. ` +
        `If this was you, open the link below within 1 hour:\n\n${resetUrl}\n\n` +
        `If you didn't request this, you can safely ignore this email.`,
    );

    if (!sent) {
      // No SMTP configured (local dev): surface the link in debug logs only
      logger.debug({ resetUrl }, 'SMTP not configured — password reset link');
    }

    logger.info({ userId: user.id }, 'Password reset requested');
    res.json(genericResponse);
  } catch (error) {
    logger.error({ err: error }, 'Forgot password error');
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Reset token is required' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    logger.info({ userId: resetToken.userId }, 'Password reset completed');
    res.json({ success: true, message: 'Password updated — you can now log in' });
  } catch (error) {
    logger.error({ err: error }, 'Reset password error');
    res.status(500).json({ success: false, message: 'Server error' });
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
