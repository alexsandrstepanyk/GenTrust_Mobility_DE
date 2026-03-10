/**
 * Outbox Pattern - Гарантована доставка подій
 * 
 * Архітектура:
 * 1. POST /reports → Main DB + Outbox Event (транзакція)
 * 2. Background Worker → читає Outbox → пише в Dept DB
 * 3. Після успіху → видаляє з Outbox
 * 
 * Переваги:
 * ✅ Гарантована доставка (навіть якщо Dept DB впала)
 * ✅ Ідемпотентність (event.id = унікальний ключ)
 * ✅ Retry логіка (3 спроби)
 */

import prisma from './prisma';

export interface OutboxEvent {
  id: string;
  type: 'REPORT_CREATED' | 'REPORT_APPROVED' | 'REPORT_REJECTED';
  payload: any;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  retryCount: number;
}

/**
 * Створити Outbox подію (всередині транзакції)
 */
export async function createOutboxEvent(
  type: OutboxEvent['type'],
  payload: any,
  tx?: any
): Promise<OutboxEvent> {
  const prismaClient = tx || prisma;
  
  return (prismaClient as any).outboxEvent.create({
    data: {
      type,
      payload,
      retryCount: 0,
    },
  });
}

/**
 * Отримати необроблені події (для воркера)
 */
export async function getUnprocessedEvents(limit: number = 10): Promise<OutboxEvent[]> {
  return (prisma as any).outboxEvent.findMany({
    where: {
      processedAt: null,
      retryCount: { lt: 3 }, // Максимум 3 спроби
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit,
  });
}

/**
 * Позначити подію як оброблену
 */
export async function markEventAsProcessed(eventId: string): Promise<void> {
  await (prisma as any).outboxEvent.update({
    where: { id: eventId },
    data: {
      processedAt: new Date(),
    },
  });
}

/**
 * Позначити подію як помилкову
 */
export async function markEventAsFailed(eventId: string, error: string): Promise<void> {
  await (prisma as any).outboxEvent.update({
    where: { id: eventId },
    data: {
      error,
      retryCount: { increment: 1 },
    },
  });
}

/**
 * Видалити старі події (старше 7 днів)
 */
export async function cleanupOldEvents(): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const result = await (prisma as any).outboxEvent.deleteMany({
    where: {
      OR: [
        { processedAt: { lt: sevenDaysAgo } },
        { retryCount: { gte: 3 } },
      ],
    },
  });
  
  return result.count;
}
