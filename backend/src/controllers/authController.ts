// controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
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
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful:', { userId: user.id, email: user.email });

    // IMPORTANT: Make sure you're returning JSON, not a string
    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    console.log('📝 Registration attempt:', { email, firstName, lastName });

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('❌ Email already registered');
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        country: 'UK',
      },
      select: {
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
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ Registration successful:', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
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
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Get current user error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      county,
      postcode,
      country,
    } = req.body;

    console.log('📝 Updating profile for user:', req.user?.id);
    console.log('📋 Update data:', { firstName, lastName, phone, city, county });

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
      select: {
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
      },
    });

    console.log('✅ Profile updated successfully');

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Update profile error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to update profile' 
    });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📸 Uploading avatar for user:', req.user?.id);

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarPath },
      select: {
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
      },
    });

    console.log('✅ Avatar uploaded successfully:', avatarPath);

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ Upload avatar error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to upload avatar' 
    });
  }
};