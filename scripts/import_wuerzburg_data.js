#!/usr/bin/env node

/**
 * SCRIPT: Import 40 Würzburg test reports into SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const TEST_DATA_PATH = path.join(__dirname, '../test_data/wuerzburg_test_reports.json');

console.log('🚀 Importing 40 Würzburg test reports into SQLite...\n');

// Read test data
const testData = JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'));

// Open database
const db = new sqlite3.Database(DB_PATH);

let imported = 0;

// Import each report
testData.reports.forEach((report, index) => {
  const sql = `
    INSERT INTO "Report" (
      "id", "authorId", "photoId", "description", "latitude", "longitude",
      "aiVerdict", "category", "status", "forwardedTo", "priority",
      "createdAt", "updatedAt"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    report.id,
    'usr_' + String(Math.floor(Math.random() * 10) + 1).padStart(3, '0'),
    `data:image/jpeg;base64,${report.photo_placeholder}`,
    report.description,
    report.latitude,
    report.longitude,
    JSON.stringify({
      is_issue: true,
      confidence: 0.95,
      category: report.department,
      description: `AI detected ${report.department} issue`
    }),
    report.department,
    'PENDING',
    report.department,
    report.priority,
    new Date().toISOString(),
    new Date().toISOString()
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error(`❌ Error importing ${report.id}:`, err.message);
    } else {
      imported++;
      console.log(`✅ Imported ${report.id} - ${report.emoji} ${report.department} - ${report.location_name}`);
    }
  });
});

// Close database and show summary
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('✅ IMPORT COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📊 Total imported: ${imported} reports`);
    console.log(`\n📍 Location: ${DB_PATH}`);
    console.log('\n💡 Next step: Restart the server to see the new reports');
    console.log('   bash start.sh\n');
  }
});
