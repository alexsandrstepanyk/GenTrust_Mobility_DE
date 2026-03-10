/**
 * Centralized Configuration
 * 
 * Всі налаштування з .env з валідацією
 * 
 * Використання:
 * import config from './config';
 * 
 * config.port          // 3000
 * config.jwt.secret    // з .env
 * config.redis.url     // redis://localhost:6379
 */

import dotenv from 'dotenv';
import path from 'path';

// Завантажити .env
dotenv.config();

// Валідація критичних змінних
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Missing required env var: ${envVar}`);
  }
}

// Перевірка JWT secret (має бути достатньо довгим)
if (process.env.JWT_SECRET!.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET is too short! Use at least 32 characters.');
  console.warn('⚠️  Generate: openssl rand -base64 32');
}

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Security
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    provider: process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' : 'sqlite',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  // Object Storage (Cloudinary)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
  },

  // AI (Google Gemini)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    enabled: !!process.env.GEMINI_API_KEY,
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  },

  // CORS
  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // Paths
  paths: {
    root: path.resolve(__dirname, '..'),
    prisma: path.resolve(__dirname, '..', 'prisma'),
    uploads: path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads'),
  },
};

// Export
export default config;
