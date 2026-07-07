import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

// Shared core: parse the Bearer token, verify it, and load the user.
// Returns undefined for missing/invalid tokens or unknown users; throws
// nothing — callers decide whether that's a 401 or an anonymous request.
async function resolveUserFromToken(req: Request): Promise<AuthRequest['user']> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer')) return undefined;

  const token = header.split(' ')[1];
  if (!token) return undefined;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: USER_SELECT,
    }) ?? undefined;
  } catch {
    return undefined;
  }
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    req.user = await resolveUserFromToken(req);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    next();
  } catch (error) {
    logger.error({ err: error }, 'Auth middleware error');
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Populates req.user when a valid token is present, but never rejects —
// for public routes that behave differently for authenticated users
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    req.user = await resolveUserFromToken(req);
  } catch {
    // Treat any failure as anonymous on public routes
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Not authorized to access this route`,
      });
    }

    next();
  };
};
