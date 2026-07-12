import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';

let io: Server | null = null;

export function initSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

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
    // Room-per-user so delivery works across multiple tabs/devices
    socket.join(userId);
    logger.debug({ userId }, 'Socket connected');
  });

  return io;
}

// Events are emitted server-side only, from validated REST handlers —
// clients cannot inject payloads for other users
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(userId).emit(event, payload);
}

// True when the user has at least one live socket (their per-user room is
// non-empty) — used to skip push notifications for users already online
export function isUserConnected(userId: string): boolean {
  return (io?.sockets.adapter.rooms.get(userId)?.size ?? 0) > 0;
}
