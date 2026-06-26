import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

import authRoutes from './routes/authRoutes';
import dogRoutes from './routes/dogRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import matchingRoutes from './routes/matchingRoutes';
import breedRoutes from './routes/breedRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

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

// Socket.io with JWT auth
const userSockets = new Map<string, string>();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    socket.data.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId as string;
  userSockets.set(userId, socket.id);
  logger.debug({ userId }, 'Socket connected');

  socket.on('sendMessage', (data) => {
    const receiverSocketId = userSockets.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', data);
    }
  });

  socket.on('disconnect', () => {
    userSockets.delete(userId);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  logger.info({ port: PORT }, 'Server started');
});

export { io };
