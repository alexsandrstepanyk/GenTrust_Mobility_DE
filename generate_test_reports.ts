#!/usr/bin/env ts-node
/**
 * Генерація тестових звітів для всіх департаментів
 * Створює по 10 звітів для кожного з 8 департаментів
 */

import prisma from './src/services/prisma';
import { getDepartmentPrisma, DepartmentId } from './src/utils/departmentDatabaseManager';

// Департаменти та їх категорії
const DEPARTMENTS: { id: DepartmentId; category: string; name: string }[] = [
  { id: 'roads', category: 'roads', name: 'Дороги' },
  { id: 'lighting', category: 'lighting', name: 'Освітлення' },
  { id: 'waste', category: 'waste', name: 'Сміття' },
  { id: 'parks', category: 'parks', name: 'Парки' },
  { id: 'water', category: 'water', name: 'Вода' },
  { id: 'transport', category: 'transport', name: 'Транспорт' },
  { id: 'ecology', category: 'ecology', name: 'Екологія' },
  { id: 'vandalism', category: 'vandalism', name: 'Вандалізм' },
];

// Тестові дані для Würzburg
const LOCATIONS = [
  { district: 'Zellerau', lat: 49.7913, lng: 23.9975 },
  { district: 'Sanderau', lat: 49.7850, lng: 24.0050 },
  { district: 'Grombühl', lat: 49.8050, lng: 24.0150 },
  { district: 'Heidingsfeld', lat: 49.7750, lng: 23.9850 },
  { district: 'Lengfeld', lat: 49.8150, lng: 24.0250 },
  { district: 'Oberdürrbach', lat: 49.7950, lng: 23.9750 },
  { district: 'Unterdürrbach', lat: 49.7880, lng: 23.9680 },
  { district: 'Rottenbauer', lat: 49.7650, lng: 23.9550 },
  { district: 'Versbach', lat: 49.8250, lng: 24.0350 },
  { district: 'Heuchelhof', lat: 49.7550, lng: 23.9950 },
];

const STATUSES = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

const DESCRIPTIONS: Record<string, string[]> = {
  roads: [
    'Яма на дорозі, пошкодження асфальту',
    'Тріщина на дорозі, небезпечно для автомобілів',
    'Відсутній люк, відкрита яма',
    'Пошкоджений бордюр',
    'Розбите дорожнє покриття',
  ],
  lighting: [
    'Не працює ліхтар',
    'Мерехтить освітлення',
    'Зламаний стовп освітлення',
    'Темна ділянка вулиці',
    'Відсутнє освітлення пішохідного переходу',
  ],
  waste: [
    'Купа сміття біля контейнера',
    'Сміття розкидане на вулиці',
    'Незаконне звалище',
    'Переповнений сміттєвий бак',
    'Будівельне сміття на дорозі',
  ],
  parks: [
    'Пошкоджена лавка в парку',
    'Зламаний дитячий майданчик',
    'Сухе дерево загрожує падінням',
    'Брудний парк',
    'Пошкоджена огорожа',
  ],
  water: [
    'Прорвало водопровід',
    'Калюжа на дорозі',
    'Забруднена вода',
    'Витік води з люка',
    'Підтоплення підвалу',
  ],
  transport: [
    'Зупинка зламана',
    'Відсутній розклад автобусів',
    'Пошкоджена зупинка',
    'Немає освітлення на зупинці',
    'Брудна зупинка',
  ],
  ecology: [
    'Забруднення повітря',
    'Незаконне спалювання сміття',
    'Забруднена водойма',
    'Шкідливі викиди',
    'Загибель дерев',
  ],
  vandalism: [
    'Графіті на будинку',
    'Пошкоджена фасадна плитка',
    'Зламана реклама',
    'Написи на стінах',
    'Пошкоджений пам\'ятник',
  ],
};

// Генерація випадкового ID користувача
async function getOrCreateTestUserId(deptId: string, index: number): Promise<string> {
  const testUserId = `test-user-${deptId}-${index}`;
  
  // Перевіряємо чи існує користувач
  const existing = await (prisma as any).user.findUnique({
    where: { id: testUserId },
  });
  
  if (existing) {
    return existing.id;
  }
  
  // Створюємо нового користувача
  const newUser = await (prisma as any).user.create({
    data: {
      id: testUserId,
      email: `${testUserId}@test.com`,
      username: testUserId,
      firstName: `Test`,
      lastName: `User ${deptId}`,
      city: 'Würzburg',
      district: 'Test District',
      role: 'SCOUT',
      status: 'ACTIVE',
    },
  });
  
  return newUser.id;
}

// Генерація тестового фото (base64 placeholder)
function generateTestPhoto(): string {
  return `data:image/jpeg;base64,TEST_PHOTO_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

async function generateTestReports() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ГЕНЕРАЦІЯ ТЕСТОВИХ ЗВІТІВ                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let totalCreated = 0;

  for (const dept of DEPARTMENTS) {
    console.log(`📂 Департамент: ${dept.name} (${dept.id})`);
    console.log('─'.repeat(50));

    const deptPrisma = getDepartmentPrisma(dept.id);
    const reports: any[] = [];

    // Генеруємо 10 звітів для департаменту
    for (let i = 0; i < 10; i++) {
      const location = LOCATIONS[i % LOCATIONS.length];
      const description = DESCRIPTIONS[dept.category][i % DESCRIPTIONS[dept.category].length];
      const status = STATUSES[i % STATUSES.length];
      const userId = await getOrCreateTestUserId(dept.id, i);
      const photoId = generateTestPhoto();

      // 1️⃣ Створюємо звіт в головній БД (для City-Hall)
      const mainReport = await (prisma as any).report.create({
        data: {
          authorId: userId,
          photoId,
          aiVerdict: JSON.stringify({
            is_issue: true,
            confidence: 0.75 + Math.random() * 0.20,
            category: dept.category,
          }),
          category: dept.category,
          description: `${description} #${i + 1}`,
          latitude: location.lat + (Math.random() - 0.5) * 0.01,
          longitude: location.lng + (Math.random() - 0.5) * 0.01,
          forwardedTo: dept.id,
          status,
        },
      });

      // 2️⃣ Створюємо звіт в БД департаменту (для обробки)
      try {
        const deptReport = await deptPrisma.departmentReport.create({
          data: {
            userId,
            photoId,
            latitude: location.lat + (Math.random() - 0.5) * 0.01,
            longitude: location.lng + (Math.random() - 0.5) * 0.01,
            aiCategory: dept.category,
            aiConfidence: 0.75 + Math.random() * 0.20,
            status,
            priority: i < 3 ? 'HIGH' : i < 6 ? 'MEDIUM' : 'LOW',
            description: `${description} #${i + 1}`,
          },
        });

        reports.push({ main: mainReport.id, dept: deptReport.id });
        totalCreated++;
      } catch (error: any) {
        console.log(`   ❌ Помилка створення звіту #${i + 1}: ${error.message}`);
      }
    }

    // Перевірка створених звітів
    const count = await deptPrisma.departmentReport.count();
    console.log(`   ✅ Створено звітів: ${reports.length}`);
    console.log(`   ✅ Всього в БД: ${count}`);
    console.log('');
  }

  console.log('═'.repeat(50));
  console.log(`📊 ЗАГАЛЬНА СТАТИСТИКА:`);
  console.log(`   ✅ Всього створено звітів: ${totalCreated}`);
  console.log(`   ✅ Департаментів: ${DEPARTMENTS.length}`);
  console.log(`   ✅ Звітів на департамент: 10`);
  console.log('═'.repeat(50));

  // Фінальна перевірка
  console.log('\n📋 ФІНАЛЬНА ПЕРЕВІРКА:\n');

  for (const dept of DEPARTMENTS) {
    const deptPrisma = getDepartmentPrisma(dept.id);
    const count = await deptPrisma.departmentReport.count();
    const mainCount = await (prisma as any).report.count({
      where: { forwardedTo: dept.id },
    });
    console.log(`   ${dept.name.padEnd(15)}: Головна БД: ${mainCount.toString().padStart(3)} | Департамент БД: ${count.toString().padStart(3)}`);
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  ГЕНЕРАЦІЯ ЗАВЕРШЕНА                                 ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

generateTestReports().catch(console.error);
