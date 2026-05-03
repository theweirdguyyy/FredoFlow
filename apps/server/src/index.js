import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './modules/auth/auth.routes.js';
import workspaceRoutes from './modules/workspaces/workspace.routes.js';
import goalRoutes from './modules/goals/goal.routes.js';
import milestoneRoutes from './modules/milestones/milestone.routes.js';
import announcementRoutes from './modules/announcements/announcement.routes.js';
import actionItemRoutes from './modules/action-items/action-item.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ─── Initialize Real-Time (Socket.io) 
initializeSocket(server);

// ─── CORS — MUST be the very first middleware 
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,                         // e.g. https://fredoflowweb-production.up.railway.app
].filter(Boolean);                                 // removes undefined if CLIENT_URL not set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Extra safety net: allow any railway.app subdomain
      if (origin.endsWith('.railway.app')) {
        return callback(null, true);
      }

      console.error(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error(`CORS: origin ${origin} is not allowed`));
    },
    credentials: true,           // Required for httpOnly cookies
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
    optionsSuccessStatus: 200,   // Some legacy browsers choke on 204
  })
);

// ─── Global Middleware 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check 
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─── API Routes 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces/:workspaceId/goals', goalRoutes);
app.use('/api/v1/workspaces/:workspaceId/goals/:goalId/milestones', milestoneRoutes);
app.use('/api/v1/workspaces/:workspaceId/announcements', announcementRoutes);
app.use('/api/v1/workspaces/:workspaceId/action-items', actionItemRoutes);
app.use('/api/v1/workspaces/:workspaceId/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Root — confirms server is alive
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'FredoFlow API is running.' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      clientUrl: process.env.CLIENT_URL || 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
    },
  });
});

// ─── 404 Handler 
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
});

// ─── Error Handler
app.use(errorHandler);

// ─── Start Server
server.listen(PORT, () => {
  console.log(`🚀 FredoFlow API running on port ${PORT}`);
  console.log(`✅ Allowed CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

export default app;