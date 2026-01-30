import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token received:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      console.log('✅ Token decoded:', { userId: decoded.id });
      
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        }
      });
      
      if (!req.user) {
        console.log('❌ User not found for id:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      console.log('✅ User authenticated:', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      });
      
      next();
    } catch (error: any) {
      console.error('❌ Token verification error:', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const userRole = req.user.role;
    console.log('🔐 Authorization check:', {
      userRole,
      requiredRoles: roles,
      hasAccess: roles.includes(userRole)
    });

    if (!roles.includes(userRole)) {
      console.log('⛔ Authorization failed:', {
        userRole,
        requiredRoles: roles
      });
      return res.status(403).json({ 
        success: false,
        message: `User role ${userRole} is not authorized to access this route. Required: ${roles.join(', ')}` 
      });
    }

    console.log('✅ Authorization successful');
    next();
  };
};