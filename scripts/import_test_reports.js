#!/usr/bin/env node

/**
 * SCRIPT: Import Würzburg test reports into database
 * Usage: node scripts/import_test_reports.js
 */

const fs = require('fs');
const path = require('path');

// Path to test data
const testDataPath = path.join(__dirname, '../test_data/wuerzburg_test_reports.json');

console.log('🚀 Importing Würzburg test reports...\n');

// Read test data
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log(`📊 Found ${testData.total_reports} reports for ${testData.departments} departments\n`);

// Generate SQL INSERT statements
console.log('📝 SQL INSERT Statements:\n');
console.log('═'.repeat(80));
console.log('-- COPY AND PASTE THIS INTO YOUR DATABASE');
console.log('═'.repeat(80));
console.log('');

testData.reports.forEach((report, index) => {
  const insertStatement = `
-- ${report.emoji} ${report.department.toUpperCase()} #${index + 1}: ${report.location_name}
INSERT INTO "Report" (
  "id",
  "authorId", 
  "photoId",
  "description",
  "latitude",
  "longitude",
  "aiVerdict",
  "category",
  "status",
  "forwardedTo",
  "priority",
  "createdAt",
  "updatedAt"
) VALUES (
  '${report.id}',
  'usr_001',
  'data:image/jpeg;base64,${report.photo_placeholder}',
  '${report.description}',
  ${report.latitude},
  ${report.longitude},
  '{"is_issue":true,"confidence":0.95,"category":"${report.category}"}',
  '${report.category}',
  'PENDING',
  '${report.department}',
  '${report.priority}',
  NOW(),
  NOW()
);
`;
  console.log(insertStatement);
});

console.log('═'.repeat(80));
console.log('✅ Done! Copy the SQL above and run it in your database.\n');

// Summary
console.log('📊 SUMMARY:\n');
console.log(`Total Reports: ${testData.total_reports}`);
console.log(`Departments: ${testData.departments}`);
console.log(`Reports per Department: ${testData.reports_per_department}\n`);

console.log('By Priority:');
Object.entries(testData.summary.by_priority).forEach(([priority, count]) => {
  const bar = '█'.repeat(count);
  console.log(`  ${priority.padEnd(8)} ${bar} ${count}`);
});

console.log('\nBy Department:');
Object.entries(testData.summary.by_department).forEach(([dept, count]) => {
  const emoji = testData.reports.find(r => r.department === dept)?.emoji || '📁';
  console.log(`  ${emoji} ${dept.padEnd(12)} ${count} reports`);
});

console.log('\n💡 TIP: Run this command to import:');
console.log('   node scripts/import_test_reports.js | psql -d gentrust_main\n');
