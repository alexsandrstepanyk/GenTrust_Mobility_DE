/**
 * Security Middleware
 * 
 * - Helmet (security headers)
 * - Rate Limiting
 * - CORS
 * - Request ID (for tracing)
 * - PII sanitization in logs
 */

import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

/**
 * Rate Limiter - захист від DDoS та спаму
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 хвилин
  max: config.rateLimit.maxRequests, // 100 запитів на IP
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // ✅ Пропустити stats endpoints для дашбордів
    if (req.path.includes('/api/stats/')) {
      return true;
    }
    // ✅ Пропустити health checks
    if (req.path === '/health' || req.path === '/api/health') {
      return true;
    }
    return false;
  },
});

/**
 * Strict Rate Limiter - для auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 5, // 5 спроб на IP
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true, // Не рахувати успішні запити
});

/**
 * Request ID - для кореляції логів
 */
export function requestIdMiddleware(req: any, res: any, next: () => void) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * Sanitize PII (Personally Identifiable Information) в логах
 */
export function sanitizePII(data: any): any {
  if (!data || typeof data !== 'string') return data;

  // Email
  data = data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  
  // Phone (різні формати)
  data = data.replace(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g, '[PHONE]');
  
  // JWT tokens
  data = data.replace(/eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, '[TOKEN]');
  
  // Credit cards (basic)
  data = data.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD]');

  return data;
}

/**
 * CORS конфігурація
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: any) {
    // Дозволити запити без origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (config.cors.origins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
