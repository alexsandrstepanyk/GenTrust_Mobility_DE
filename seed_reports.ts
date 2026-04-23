import prisma from './src/services/prisma';
import { getDepartmentPrisma } from './src/utils/departmentDatabaseManager';
import { v4 as uuidv4 } from 'uuid';

const userId = '3754899b-f0a8-4492-a9be-c9c656c69b12';
const placeholderPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const departments = [
  'roads', 'lighting', 'waste', 'parks', 'water', 'transport', 'ecology', 'vandalism'
];

const descriptions = [
  'Minor issue detected',
  'Requires urgent attention',
  'Reported by local resident',
  'Routine inspection finding',
  'Infrastructure damage',
  'Safety concern',
  'Maintenance requested',
  'Broken element',
  'Non-functional equipment',
  'General report'
];

async function seed() {
  console.log('🚀 Starting seed process...');

  for (const dept of departments) {
    console.log(`\n📂 Seeding ${dept}...`);
    const deptPrisma = getDepartmentPrisma(dept);

    for (let i = 1; i <= 10; i++) {
      const id = uuidv4();
      const title = `${dept.toUpperCase()} Issue #${i}`;
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const lat = 49.79 + (Math.random() * 0.02);
      const lng = 9.93 + (Math.random() * 0.05);

      // Create in Main DB
      await (prisma as any).report.create({
        data: {
          id,
          authorId: userId,
          photoId: placeholderPhoto,
          category: dept,
          description: `${title}: ${description}`,
          latitude: lat,
          longitude: lng,
          forwardedTo: dept,
          status: 'PENDING'
        }
      });

      // Create in Department DB
      await deptPrisma.departmentReport.create({
        data: {
          id,
          userId,
          photoId: placeholderPhoto,
          latitude: lat,
          longitude: lng,
          aiCategory: dept,
          status: 'PENDING',
          description: `${title}: ${description}`
        }
      });

      process.stdout.write('.');
    }
  }

  console.log('\n\n✅ Seeding completed! Created 80 reports.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
