import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import { apiLimiter } from './middleware/rateLimits';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import logger from './utils/logger';

import authRoutes from './routes/authRoutes';
import dogRoutes from './routes/dogRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import matchingRoutes from './routes/matchingRoutes';
import breedRoutes from './routes/breedRoutes';
import pushRoutes from './routes/pushRoutes';
import favoriteRoutes from './routes/favoriteRoutes';

dotenv.config();

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  logger.fatal({ missing: missingEnv }, 'Missing required environment variables');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
initSocket(server);

// Required behind a reverse proxy (Railway/Render/etc.) so rate limiting
// sees real client IPs instead of the proxy's
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running!' });
});

// The strict brute-force limiter is applied per-route inside authRoutes
// (login/register/password reset only); routine routes like /auth/me share
// the general limit
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/dogs', apiLimiter, dogRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/matching', apiLimiter, matchingRoutes);
app.use('/api/breeds', apiLimiter, breedRoutes);
app.use('/api/push', apiLimiter, pushRoutes);
app.use('/api/favorites', apiLimiter, favoriteRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  logger.info({ port: PORT }, 'Server started');
});
