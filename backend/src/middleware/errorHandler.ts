import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  const isProd = process.env.NODE_ENV === 'production';

  res.status(err.statusCode || 500).json({
    success: false,
    message: isProd ? 'An unexpected error occurred' : (err.message || 'Server Error'),
    ...(isProd ? {} : { errors: err.errors }),
  });
};
