/**
 * GENTRUST MOBILITY API Server v6.0.0
 *
 * Start: npx ts-node src/api-server.ts
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config';
import { apiLimiter, requestIdMiddleware, corsOptions } from './middleware/security';
import healthRoutes from './api/routes/health';
import reportRoutes from './api/routes/reports';
import statsRoutes from './api/routes/stats';
import questRoutes from './api/routes/quests';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/users';
import taskOrderRoutes from './api/routes/task_orders';
import completionRoutes from './api/routes/completions';
import consentRoutes from './api/routes/consent';
import departmentsManagerRoutes from './api/routes/departments-manager';
import { startOutboxWorker } from './workers/outboxWorker';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:8083',
      'http://192.168.178.34:5173',
      'http://192.168.178.34:5174',
      'http://192.168.178.34:5175',
      'http://192.168.178.34:5176',
      'http://192.168.178.34:8081',
      'http://192.168.178.34:8082',
      'http://192.168.178.34:8083'
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.use((socket, next) => {
  try {
    const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!rawToken) {
      return next(new Error('Authentication error: No token provided'));
    }

    const token = String(rawToken).startsWith('Bearer ')
      ? String(rawToken).slice(7)
      : String(rawToken);

    const decoded = jwt.verify(token, config.jwt.secret);
    (socket.data as any).user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  socket.emit('connected', {
    message: 'Connected to GenTrust realtime server',
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  socket.on('report:subscribe', () => socket.join('reports'));
  socket.on('report:unsubscribe', () => socket.leave('reports'));
  socket.on('stats:subscribe', () => socket.join('stats'));
  socket.on('stats:unsubscribe', () => socket.leave('stats'));
  socket.on('user:subscribe', () => socket.join('users'));
  socket.on('user:unsubscribe', () => socket.leave('users'));
});

(global as any).io = io;

// Security
app.use(helmet());
app.use(cors(corsOptions));
app.use('/api', apiLimiter);
app.use(requestIdMiddleware);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logging
app.use(morgan('combined'));

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/task-orders', taskOrderRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/departments-manager', departmentsManagerRoutes);

app.get('/api', (req, res) => {
  res.json({
    name: 'GenTrust Mobility API',
    version: 'v6.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.env === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
const server = httpServer.listen(config.port, config.host, () => {
  console.log(`🚀 API Server started on http://${config.host}:${config.port}`);
  console.log(`📊 Environment: ${config.env}`);
  console.log(`🔒 Security: Helmet + Rate Limit + CORS`);
  console.log('🔌 Socket.IO enabled on same port');
  
  // Start Outbox Worker
  startOutboxWorker();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
export { io };
