/**
 * GENTRUST MOBILITY API Server v6.0.0
 * 
 * Start: npx ts-node src/api-server.ts
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { apiLimiter, requestIdMiddleware, corsOptions } from './middleware/security';
import healthRoutes from './api/routes/health';
import reportRoutes from './api/routes/reports';
import { startOutboxWorker } from './workers/outboxWorker';

const app = express();

// Security
app.use(helmet());
app.use(cors(corsOptions));
app.use('/api', apiLimiter);
app.use(requestIdMiddleware);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Routes
app.use('/health', healthRoutes);
app.use('/api/reports', reportRoutes);

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
const server = app.listen(config.port, config.host, () => {
  console.log(`🚀 API Server started on http://${config.host}:${config.port}`);
  console.log(`📊 Environment: ${config.env}`);
  console.log(`🔒 Security: Helmet + Rate Limit + CORS`);
  
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
