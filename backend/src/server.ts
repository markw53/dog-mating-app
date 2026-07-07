import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strict rate limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dogs', apiLimiter, dogRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/reviews', apiLimiter, reviewRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/matching', apiLimiter, matchingRoutes);
app.use('/api/breeds', apiLimiter, breedRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  logger.info({ port: PORT }, 'Server started');
});
