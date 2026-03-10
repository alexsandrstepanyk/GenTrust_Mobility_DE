/**
 * GENTRUST MOBILITY API Server v6.0.0
 * 
 * Optimizations:
 * ✅ Database Indexes
 * ✅ Redis Cache
 * ✅ Eager Loading (N+1 Fix)
 * ✅ Outbox Pattern
 * ✅ Security (Helmet, Rate Limit, CORS)
 * ✅ Structured Logging
 * ✅ Health Checks
 * ✅ Object Storage (Cloudinary)
 * ✅ Background Jobs
 * 
 * Start: npm run api
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import logger from './utils/logger';
import { apiLimiter, requestIdMiddleware, corsOptions } from './middleware/security';
import healthRoutes from './api/routes/health';
import reportRoutes from './api/routes/reports';
import { startOutboxWorker } from './workers/outboxWorker';

const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Helmet (security headers)
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Rate Limiting
app.use('/api', apiLimiter);

// Request ID
app.use(requestIdMiddleware);

// ========================================
// PARSING MIDDLEWARE
// ========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// LOGGING
// ========================================

// Custom morgan format with request ID
const logFormat = ':method :url :status :res[content-length] - :response-time ms (ID: :req[x-request-id])';

app.use(morgan(logFormat, {
  stream: {
    write: (message) => {
      const logData = message.trim();
      logger.info(logData);
    },
  },
}));

// ========================================
// ROUTES
// ========================================

// Health checks
app.use('/health', healthRoutes);

// API routes
app.use('/api/reports', reportRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'GenTrust Mobility API',
    version: 'v6.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      healthReady: '/health/ready',
      healthLive: '/health/live',
      reports: '/api/reports',
    },
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.env === 'development' ? err.message : 'Something went wrong',
  });
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 API Server started on http://${config.host}:${config.port}`);
  logger.info(`📊 Environment: ${config.env}`);
  logger.info(`🔒 Security: Helmet + Rate Limit + CORS`);
  
  // Start Outbox Worker
  startOutboxWorker();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    import('./services/prisma').then(({ default: prisma }) => {
      prisma.$disconnect();
      logger.info('Database disconnected');
      
      // Close Redis
      import('./services/cache').then(({ getRedis }) => {
        const redis = getRedis();
        if (redis) {
          redis.quit();
          logger.info('Redis disconnected');
        }
        
        process.exit(0);
      });
    });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
