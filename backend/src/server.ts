import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import dogRoutes from './routes/dogRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files - IMPORTANT: This must be before routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// Socket.io
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId: string) => {
    userSockets.set(userId, socket.id);
  });

  socket.on('sendMessage', (data) => {
    const receiverSocketId = userSockets.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', data);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, '../uploads')}`);
});

export { io };