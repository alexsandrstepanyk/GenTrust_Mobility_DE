/**
 * Outbox Worker - обробка подій з черги
 * 
 * Запускається кожні 5 секунд:
 * 1. Читає необроблені події з Outbox
 * 2. Обробляє кожну подію (запис в Dept DB)
 * 3. Позначає як оброблену або failed
 * 
 * Retry логіка:
 * - Максимум 3 спроби
 * - Після 3 failed - подія видаляється через 7 днів
 */

import { getUnprocessedEvents, markEventAsProcessed, markEventAsFailed } from './outbox';
import { getDepartmentPrisma } from '../utils/departmentDatabaseManager';

const PROCESS_INTERVAL = 5000; // 5 секунд
const MAX_RETRIES = 3;

/**
 * Обробити одну подію
 */
async function processEvent(event: any): Promise<void> {
  const payload = JSON.parse(event.payload);
  
  console.log(`📦 Обробка події: ${event.type} (${event.id})`);
  
  try {
    switch (event.type) {
      case 'REPORT_CREATED':
        await handleReportCreated(payload);
        break;
      case 'REPORT_APPROVED':
        await handleReportApproved(payload);
        break;
      case 'REPORT_REJECTED':
        await handleReportRejected(payload);
        break;
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
    
    // ✅ Успіх - позначити як оброблену
    await markEventAsProcessed(event.id);
    console.log(`✅ Подія оброблена: ${event.id}`);
    
  } catch (error: any) {
    console.error(`❌ Помилка обробки події ${event.id}:`, error.message);
    
    // ❌ Помилка - збільшити retry count
    await markEventAsFailed(event.id, error.message);
    
    if (event.retryCount >= MAX_RETRIES) {
      console.error(`⚠️  Подія ${event.id} перевищила ліміт спроб (${MAX_RETRIES})`);
    }
  }
}

/**
 * Обробка REPORT_CREATED - запис в Dept DB
 */
async function handleReportCreated(payload: any): Promise<void> {
  const { reportId, departmentId, userId, photoId, latitude, longitude, aiCategory, status } = payload;
  
  if (!departmentId) {
    console.warn(`⚠️  Report ${reportId} не має departmentId, пропускаємо`);
    return;
  }
  
  const deptPrisma = getDepartmentPrisma(departmentId);
  
  // ✅ Ідемпотентність - перевіряємо чи вже існує
  const existing = await deptPrisma.departmentReport.findUnique({
    where: { id: reportId },
  });
  
  if (existing) {
    console.log(`⏭️  Report ${reportId} вже існує в Dept DB, пропускаємо`);
    return;
  }
  
  // ✅ Запис в Dept DB
  await deptPrisma.departmentReport.create({
    data: {
      id: reportId, // ✅ Використовуємо той самий ID для ідемпотентності
      userId,
      photoId,
      latitude,
      longitude,
      aiCategory,
      status,
    },
  });
  
  console.log(`✅ Report ${reportId} записано в ${departmentId} Dept DB`);
}

/**
 * Обробка REPORT_APPROVED - оновлення статусу в Dept DB
 */
async function handleReportApproved(payload: any): Promise<void> {
  const { reportId, departmentId } = payload;
  
  if (!departmentId) return;
  
  const deptPrisma = getDepartmentPrisma(departmentId);
  
  await deptPrisma.departmentReport.updateMany({
    where: { id: reportId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });
  
  console.log(`✅ Report ${reportId} APPROVED в ${departmentId} Dept DB`);
}

/**
 * Обробка REPORT_REJECTED - оновлення статусу в Dept DB
 */
async function handleReportRejected(payload: any): Promise<void> {
  const { reportId, departmentId, rejectionReason } = payload;
  
  if (!departmentId) return;
  
  const deptPrisma = getDepartmentPrisma(departmentId);
  
  await deptPrisma.departmentReport.updateMany({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      rejectionReason,
      rejectedAt: new Date(),
    },
  });
  
  console.log(`✅ Report ${reportId} REJECTED в ${departmentId} Dept DB`);
}

/**
 * Головний цикл воркера
 */
async function workerLoop(): Promise<void> {
  console.log('🔄 Outbox Worker запущено...');
  
  setInterval(async () => {
    try {
      const events = await getUnprocessedEvents(10);
      
      if (events.length === 0) {
        return; // Немає подій для обробки
      }
      
      console.log(`📦 Знайдено ${events.length} необроблених подій`);
      
      // Обробляємо події паралельно (але не більше 5 одночасно)
      const batch = events.slice(0, 5);
      await Promise.all(batch.map(event => processEvent(event)));
      
    } catch (error: any) {
      console.error('❌ помилка Outbox Worker:', error.message);
    }
  }, PROCESS_INTERVAL);
}

// Запуск воркера
export function startOutboxWorker(): void {
  workerLoop().catch(console.error);
  console.log('✅ Outbox Worker ініціалізовано');
}
