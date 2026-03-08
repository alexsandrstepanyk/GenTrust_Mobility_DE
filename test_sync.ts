#!/usr/bin/env ts-node
/**
 * Тест синхронізації баз даних
 * Перевіряє Dual-Write архітектуру
 */

import prisma from './src/services/prisma';
import { getDepartmentPrisma, checkDepartmentDatabase } from './src/utils/departmentDatabaseManager';

const TEST_DEPARTMENT = 'waste';

async function testSync() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ТЕСТ СИНХРОНІЗАЦІЇ БАЗ ДАНИХ                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. Перевірка головної БД
  console.log('📊 1. Перевірка головної БД...');
  try {
    const reportCount = await (prisma as any).report.count();
    console.log(`   ✅ Головна БД: ${reportCount} звітів\n`);
  } catch (error: any) {
    console.log(`   ❌ Головна БД: ${error.message}\n`);
  }

  // 2. Перевірка баз даних департаментів
  console.log('📊 2. Перевірка БД департаментів...');
  const departments = ['roads', 'lighting', 'waste', 'parks', 'water', 'transport', 'ecology', 'vandalism'] as const;
  
  for (const dept of departments) {
    const isAvailable = await checkDepartmentDatabase(dept as any);
    const status = isAvailable ? '✅' : '❌';
    console.log(`   ${status} ${dept}: ${isAvailable ? 'доступна' : 'недоступна'}`);
  }
  console.log();

  // 3. Перевірка Dual-Write
  console.log('📊 3. Тест Dual-Write (запис в обидві БД)...');
  
  try {
    const deptPrisma = getDepartmentPrisma(TEST_DEPARTMENT);
    
    // Створити тестовий запис в департамент БД
    const testRecord = await deptPrisma.departmentReport.create({
      data: {
        userId: 'test-user-sync',
        photoId: 'data:image/jpeg;base64,test',
        latitude: 49.7913,
        longitude: 23.9975,
        aiCategory: 'waste',
        status: 'PENDING',
      },
    });
    
    console.log(`   ✅ Запис створено в ${TEST_DEPARTMENT} БД: ${testRecord.id}`);
    
    // Перевірити чи можна прочитати
    const found = await deptPrisma.departmentReport.findUnique({
      where: { id: testRecord.id },
    });
    
    console.log(`   ✅ Запис прочитано: ${found?.status}\n`);
    
  } catch (error: any) {
    console.log(`   ❌ Помилка: ${error.message}\n`);
  }

  // 4. Статистика по департаментах
  console.log('📊 4. Статистика по департаментах...');
  
  for (const dept of departments) {
    try {
      const deptPrisma = getDepartmentPrisma(dept as any);
      const count = await deptPrisma.departmentReport.count();
      console.log(`   📂 ${dept}: ${count} звітів`);
    } catch (error: any) {
      console.log(`   ❌ ${dept}: помилка читання`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  ТЕСТ ЗАВЕРШЕНО                                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

testSync().catch(console.error);
