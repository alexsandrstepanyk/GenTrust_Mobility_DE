/**
 * Department Database Manager
 * Управляє підключеннями до баз даних департаментів
 * 
 * Кожен департамент має власну SQLite БД для ізоляції та стійкості
 */

import path from 'path';
import { PrismaClient } from '@prisma/client-department';

// Типи департаментів
export type DepartmentId = string;

// Мапа шляхів до баз даних (використовуємо абсолютні шляхи)
const PROJECT_ROOT = process.cwd();

const DEPARTMENT_DB_PATHS: Record<DepartmentId, string> = {
  roads: `file:${path.join(PROJECT_ROOT, 'databases/roads_dept.db')}`,
  lighting: `file:${path.join(PROJECT_ROOT, 'databases/lighting_dept.db')}`,
  waste: `file:${path.join(PROJECT_ROOT, 'databases/waste_dept.db')}`,
  parks: `file:${path.join(PROJECT_ROOT, 'databases/parks_dept.db')}`,
  water: `file:${path.join(PROJECT_ROOT, 'databases/water_dept.db')}`,
  transport: `file:${path.join(PROJECT_ROOT, 'databases/transport_dept.db')}`,
  ecology: `file:${path.join(PROJECT_ROOT, 'databases/ecology_dept.db')}`,
  vandalism: `file:${path.join(PROJECT_ROOT, 'databases/vandalism_dept.db')}`,
};

function sanitizeDepartmentId(departmentId: string): string {
  return String(departmentId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
}

function getDepartmentDbUrl(departmentId: DepartmentId): string {
  const normalized = sanitizeDepartmentId(departmentId);
  return DEPARTMENT_DB_PATHS[normalized]
    || `file:${path.join(PROJECT_ROOT, `databases/${normalized}_dept.db`)}`;
}

// Кеш Prisma клієнтів для кожного департаменту
const prismaClients: Partial<Record<DepartmentId, PrismaClient>> = {};

/**
 * Отримати Prisma клієнт для конкретного департаменту
 * Клієнти кешуються для повторного використання
 */
export function getDepartmentPrisma(departmentId: DepartmentId): PrismaClient {
  const normalizedDepartmentId = sanitizeDepartmentId(departmentId);

  // Перевіряємо чи вже є кешований клієнт
  if (prismaClients[normalizedDepartmentId]) {
    return prismaClients[normalizedDepartmentId]!;
  }

  // Створюємо новий підключення
  const dbPath = getDepartmentDbUrl(normalizedDepartmentId);
  
  if (!dbPath) {
    throw new Error(`Unknown department: ${normalizedDepartmentId}`);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbPath,
      },
    },
  });

  // Кешуємо клієнта
  prismaClients[normalizedDepartmentId] = prisma;

  console.log(`✅ Department Prisma Client created for: ${normalizedDepartmentId}`);
  
  return prisma;
}

/**
 * Отримати всі доступні департаменти
 */
export function getAllDepartments(): DepartmentId[] {
  return Object.keys(DEPARTMENT_DB_PATHS);
}

/**
 * Перевірити доступність бази даних департаменту
 */
export async function checkDepartmentDatabase(departmentId: DepartmentId): Promise<boolean> {
  try {
    const prisma = getDepartmentPrisma(departmentId);
    await prisma.departmentReport.count();
    return true;
  } catch (error) {
    console.error(`❌ Department ${departmentId} database check failed:`, error);
    return false;
  }
}

/**
 * Закрити всі підключення до баз даних департаментів
 * Викликати при завершенні роботи сервера
 */
export async function closeAllDepartmentConnections(): Promise<void> {
  const closePromises = Object.values(prismaClients).map(async (prisma) => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  await Promise.all(closePromises);
  
  // Очищаємо кеш
  Object.keys(prismaClients).forEach(key => {
    delete prismaClients[key as DepartmentId];
  });

  console.log('✅ All department database connections closed');
}

// Export для використання в ботах та інших модулях
export default {
  getDepartmentPrisma,
  getAllDepartments,
  checkDepartmentDatabase,
  closeAllDepartmentConnections,
};
