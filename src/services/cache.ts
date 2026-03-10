/**
 * Redis Cache Service
 * Кешування для оптимізації запитів до БД
 * 
 * Використання:
 * import cache from './services/cache';
 * 
 * // Отримати з кешу
 * const cached = await cache.get('reports:all');
 * 
 * // Зберегти в кеш (5 хвилин)
 * await cache.set('reports:all', data, 300);
 */

import Redis from 'ioredis';

// Підключення до Redis (локально або через змінну оточення)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;

// Ініціалізація підключення
export function initRedis(): Redis {
  if (redis) {
    return redis;
  }

  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailure: 100,
    lazyConnect: true,
  });

  redis.on('error', (error) => {
    console.warn('⚠️  Redis connection error:', error.message);
    console.warn('⚠️  Cache disabled, falling back to database');
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  return redis;
}

// Отримати екземпляр Redis
export function getRedis(): Redis | null {
  if (!redis) {
    return null;
  }
  return redis;
}

// Cache helper functions
export const cache = {
  /**
   * Отримати дані з кешу
   * @param key Унікальний ключ
   * @returns Дані або null
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;

    try {
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Зберегти дані в кеш
   * @param key Унікальний ключ
   * @param value Дані для збереження
   * @param ttl Час життя в секундах (за замовчуванням 300 = 5 хвилин)
   */
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Видалити дані з кешу
   * @param key Унікальний ключ
   */
  async delete(key: string): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  /**
   * Видалити всі ключі з префіксом
   * @param prefix Префікс ключів
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error('Cache deleteByPrefix error:', error);
    }
  },

  /**
   * Отримати або встановити (Cache-Aside pattern)
   * @param key Унікальний ключ
   * @param fetchFn Функція для отримання даних якщо немає в кеші
   * @param ttl Час життя в секундах
   * @returns Дані з кешу або з fetchFn
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Спробувати отримати з кешу
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Отримати з БД/API
    const data = await fetchFn();

    // Зберегти в кеш
    await this.set(key, data, ttl);

    return data;
  },

  /**
   * Перевірити підключення
   */
  async isConnected(): Promise<boolean> {
    const client = getRedis();
    if (!client) return false;

    try {
      await client.ping();
      return true;
    } catch {
      return false;
    }
  },
};

// Експорт за замовчуванням
export default cache;
