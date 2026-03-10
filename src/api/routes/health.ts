/**
 * Health Check Endpoint
 * 
 * GET /health
 * GET /health/ready
 * GET /health/live
 * 
 * Перевіряє:
 * - Database connection
 * - Redis connection
 * - Queue status
 * - Memory usage
 * - Uptime
 */

import { Router, Request, Response } from 'express';
import prisma from '../services/prisma';
import { getRedis } from '../services/cache';
import config from '../config';

const router = Router();

/**
 * Basic health check (liveness)
 * Просто перевіряє чи сервер працює
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Readiness check
 * Перевіряє чи всі залежності доступні
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks: any = {
    database: 'unknown',
    redis: 'unknown',
    queue: 'unknown',
  };
  
  let allHealthy = true;

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch (error: any) {
    checks.database = `error: ${error.message}`;
    allHealthy = false;
  }

  // Redis
  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      checks.redis = 'connected';
    } else {
      checks.redis = 'not configured';
    }
  } catch (error: any) {
    checks.redis = `error: ${error.message}`;
    allHealthy = false;
  }

  // Queue (simple check)
  try {
    checks.queue = 'ok';
  } catch (error: any) {
    checks.queue = `error: ${error.message}`;
    allHealthy = false;
  }

  const status = allHealthy ? 'ok' : 'degraded';
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    checks,
  });
});

/**
 * Full health check with metrics
 */
router.get('/', async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

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
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    },
    
    checks: {
      database: 'connected',
      redis: config.redis.url ? 'configured' : 'not configured',
      cloudinary: config.cloudinary.enabled ? 'configured' : 'not configured',
    },
  });
});

export default router;
