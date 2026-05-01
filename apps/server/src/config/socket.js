import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

let io;
const presenceMap = new Map(); // Map<workspaceId, Set<userId>>

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Auth Middleware
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) return next(new Error('Authentication error: No cookies'));

      const parsedCookies = cookie.parse(cookies);
      const token = parsedCookies.accessToken;

      if (!token) return next(new Error('Authentication error: No token'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded; // Attach user to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Handle Joining Workspace
    socket.on('JOIN_WORKSPACE', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      
      // Update presence
      if (!presenceMap.has(workspaceId)) {
        presenceMap.set(workspaceId, new Set());
      }
      presenceMap.get(workspaceId).add(userId);

      // Emit updated online members
      const onlineMembers = Array.from(presenceMap.get(workspaceId));
      io.to(`workspace:${workspaceId}`).emit('ONLINE_MEMBERS', onlineMembers);
      
      console.log(`🏠 User ${userId} joined workspace:${workspaceId}`);
    });

    // Handle Leaving Workspace
    socket.on('LEAVE_WORKSPACE', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      
      if (presenceMap.has(workspaceId)) {
        presenceMap.get(workspaceId).delete(userId);
        const onlineMembers = Array.from(presenceMap.get(workspaceId));
        io.to(`workspace:${workspaceId}`).emit('ONLINE_MEMBERS', onlineMembers);
      }
      
      console.log(`🏃 User ${userId} left workspace:${workspaceId}`);
    });

    socket.on('disconnecting', () => {
      // Clean up presence from all rooms the socket was in
      for (const room of socket.rooms) {
        if (room.startsWith('workspace:')) {
          const workspaceId = room.split(':')[1];
          if (presenceMap.has(workspaceId)) {
            presenceMap.get(workspaceId).delete(userId);
            const onlineMembers = Array.from(presenceMap.get(workspaceId));
            io.to(room).emit('ONLINE_MEMBERS', onlineMembers);
            io.to(room).emit('USER_OFFLINE', userId);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}
