/**
 * Structured Logging with Pino
 * 
 * - JSON формат для машинного читання
 * - Кореляційний requestId
 - Санітизація PII
 * - Різні рівні (debug, info, warn, error)
 * 
 * Використання:
 * import logger from './logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Database error', { error: '...' });
 */

import pino from 'pino';
import { sanitizePII } from '../middleware/security';
import config from '../config';

// Форматування для development (pretty)
const prettyPrint = config.env === 'development' ? {
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname',
} : false;

// Створення logger
const logger = pino({
  level: config.logging.level,
  transport: prettyPrint ? {
    target: 'pino-pretty',
    options: prettyPrint,
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  hooks: {
    logMethod(args: any[], method: any) {
      // Санітизація PII в логах
      const sanitizedArgs = args.map(arg => {
        if (typeof arg === 'string') {
          return sanitizePII(arg);
        }
        if (typeof arg === 'object' && arg !== null) {
          try {
            const stringified = JSON.stringify(arg);
            const sanitized = sanitizePII(stringified);
            return JSON.parse(sanitized);
          } catch {
            return arg;
          }
        }
        return arg;
      });

      return method.apply(this, sanitizedArgs);
    },
  },
});

// Helper для створення child logger з requestId
export function createChildLogger(requestId?: string) {
  if (!requestId) {
    return logger;
  }
  
  return logger.child({ requestId });
}

// Export
export default logger;
