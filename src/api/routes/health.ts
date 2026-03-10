/**
 * Health Check Endpoint (Simple Version)
 */
import { Router, Request, Response } from 'express';
import config from '../../config';

const router = Router();

router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/ready', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'ok',
      redis: config.redis.url ? 'configured' : 'not configured',
    },
  });
});

router.get('/', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: 'v6.0.0',
    env: config.env,
    system: {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    },
    checks: {
      database: 'configured',
      redis: config.redis.url ? 'configured' : 'not configured',
      cloudinary: config.cloudinary.enabled ? 'configured' : 'not configured',
    },
  });
});

export default router;
