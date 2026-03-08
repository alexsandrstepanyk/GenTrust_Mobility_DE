import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import questRoutes from './routes/quests';
import leaderboardRoutes from './routes/leaderboard';
import taskOrderRoutes from './routes/task_orders';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import parentRoutes from './routes/parents';
import completionRoutes from './routes/completions';
import statsRoutes from './routes/stats';
// import departmentRoutes from './routes/departments'; // DISABLED: 2026-03-06
// import germanComplianceRoutes from './german/compliance';
// import germanSmsRoutes from './german/sms';
import morgan from 'morgan';
import { errorHandler } from './middleware/error';
import path from 'path';
// import exceptionManager from '../services/exception_manager';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.178.34:5173', 'http://192.168.178.34:5174', 'http://localhost:8081', 'http://localhost:8082', 'http://192.168.178.34:8081', 'http://192.168.178.34:8082'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(morgan('dev'));
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.178.34:5173', 'http://192.168.178.34:5174', 'http://localhost:8081', 'http://localhost:8082', 'http://192.168.178.34:8081', 'http://192.168.178.34:8082'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/task-orders', taskOrderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stats', statsRoutes);
// app.use('/api/departments', departmentRoutes); // DISABLED: 2026-03-06
// app.use('/api/german', germanComplianceRoutes);
// app.use('/api/german', germanSmsRoutes);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    // Token validation happens in your auth middleware
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  // Send initial connection confirmation
  socket.emit('connected', { 
    message: 'Connected to server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Report events
  socket.on('report:list', (callback) => {
    socket.emit('report:list:response', { 
      status: 'ok',
      message: 'Use REST API /api/reports endpoint'
    });
    if (callback) callback({ status: 'ok' });
  });

  socket.on('report:subscribe', () => {
    socket.join('reports');
    console.log(`[Socket.IO] User joined reports room: ${socket.id}`);
  });

  socket.on('report:unsubscribe', () => {
    socket.leave('reports');
    console.log(`[Socket.IO] User left reports room: ${socket.id}`);
  });

  // Stats events
  socket.on('stats:subscribe', () => {
    socket.join('stats');
    console.log(`[Socket.IO] User joined stats room: ${socket.id}`);
  });

  socket.on('stats:unsubscribe', () => {
    socket.leave('stats');
    console.log(`[Socket.IO] User left stats room: ${socket.id}`);
  });

  // User events
  socket.on('user:subscribe', () => {
    socket.join('users');
  });

  socket.on('user:unsubscribe', () => {
    socket.leave('users');
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[Socket.IO] Error on socket ${socket.id}:`, error);
  });
});

// Make io globally accessible for emitting events from API routes
(global as any).io = io;

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        ip: req.ip,
        host: req.hostname
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        ip: req.ip,
        host: req.hostname,
        headers: req.headers
    });
});

// Error handling
app.use(errorHandler);

const portNumber = Number(PORT);
httpServer.listen(portNumber, '0.0.0.0', () => {
    // exceptionManager.info("API", `GenTrust API Server running on port ${PORT}`);
    console.log(`🚀 GenTrust API Server running on port ${portNumber} (0.0.0.0)`);
    console.log(`🔌 Socket.IO enabled on same port`);
});

export default app;
export { io };

