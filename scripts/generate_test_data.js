#!/usr/bin/env node

/**
 * SCRIPT: Generate test data for all 8 departments
 * Location: Würzburg, Germany
 * Creates: 40 reports (5 per department) with real coordinates
 */

const fs = require('fs');
const path = require('path');

// Würzburg coordinates
const WUERZBURG_CENTER = { lat: 49.7913, lng: 9.9534 };

// Real locations in Würzburg
const LOCATIONS = {
  roads: [
    { name: 'Theodor-Heuss-Straße', lat: 49.7895, lng: 9.9345, desc: 'Велика яма на дорозі' },
    { name: 'Mönchbergstraße', lat: 49.7823, lng: 9.9456, desc: 'Пошкоджене дорожнє покриття' },
    { name: 'Versbacher Straße', lat: 49.8012, lng: 9.9234, desc: 'Небезпечна яма біля зупинки' },
    { name: 'Sanderring', lat: 49.7934, lng: 9.9412, desc: 'Зруйнований бордюр' },
    { name: 'Rottendorfer Straße', lat: 49.7756, lng: 9.9678, desc: 'Глибока яма на перехресті' },
  ],
  lighting: [
    { name: 'Residenzplatz', lat: 49.7947, lng: 9.9327, desc: 'Ліхтар не працює' },
    { name: 'Domstraße', lat: 49.7956, lng: 9.9312, desc: 'Мерехтить вуличне освітлення' },
    { name: 'Juliuspromenade', lat: 49.7923, lng: 9.9389, desc: 'Повністю темна вулиця' },
    { name: 'Bismarckplatz', lat: 49.7889, lng: 9.9401, desc: 'Ліхтар пошкоджений' },
    { name: 'Bahnhofstraße', lat: 49.7867, lng: 9.9445, desc: 'Освітлення не працює всю ніч' },
  ],
  waste: [
    { name: 'Mainwiese', lat: 49.7912, lng: 9.9234, desc: 'Велика купа сміття на траві' },
    { name: 'Luitpoldpark', lat: 49.7834, lng: 9.9512, desc: 'Переповнений смітник' },
    { name: 'Sanderau Park', lat: 49.7789, lng: 9.9534, desc: 'Розкидане сміття навколо урни' },
    { name: 'Festungsberg', lat: 49.7967, lng: 9.9289, desc: 'Пластикові пляшки розкидані' },
    { name: 'Alter Kranen', lat: 49.7901, lng: 9.9301, desc: 'Сміття плаває в річці' },
  ],
  parks: [
    { name: 'Stadtgarten', lat: 49.7845, lng: 9.9423, desc: 'Зламані гойдалки' },
    { name: 'Luitpoldhöhe', lat: 49.7812, lng: 9.9534, desc: 'Повалене дерево' },
    { name: 'Weingarten', lat: 49.7923, lng: 9.9612, desc: 'Висохлі квітники' },
    { name: 'Klosterberg', lat: 49.7801, lng: 9.9489, desc: 'Знищена лавка' },
    { name: 'Schlossberg', lat: 49.7934, lng: 9.9267, desc: 'Паркан зруйнований' },
  ],
  water: [
    { name: 'Marktplatz', lat: 49.7934, lng: 9.9334, desc: 'Прорвало водогін' },
    { name: 'Eichhornstraße', lat: 49.7878, lng: 9.9423, desc: 'Вода тече з люка' },
    { name: 'Kaiserstraße', lat: 49.7856, lng: 9.9467, desc: 'Забруднена питна вода' },
    { name: 'Pleicher Ring', lat: 49.7989, lng: 9.9378, desc: 'Фонтан не працює' },
    { name: 'Zeller Straße', lat: 49.8023, lng: 9.9289, desc: 'Калюжа не зникає' },
  ],
  transport: [
    { name: 'Hauptbahnhof', lat: 49.7867, lng: 9.9512, desc: 'Зупинка зруйнована' },
    { name: 'Bischof-Meiser-Straße', lat: 49.7945, lng: 9.9401, desc: 'Трамвайні колії пошкоджені' },
    { name: 'Schönbornstraße', lat: 49.7912, lng: 9.9356, desc: 'Автобусна зупинка без даху' },
    { name: 'Röntgenring', lat: 49.7978, lng: 9.9445, desc: 'Велосмуга зруйнована' },
    { name: 'Berliner Ring', lat: 49.8034, lng: 9.9512, desc: 'Світлофор не працює' },
  ],
  ecology: [
    { name: 'Main River', lat: 49.7889, lng: 9.9178, desc: 'Нафтова пляма на воді' },
    { name: 'Hubland Campus', lat: 49.7756, lng: 9.9734, desc: 'Хімічне забруднення ґрунту' },
    { name: 'Grombühl', lat: 49.8045, lng: 9.9623, desc: 'Повітря забруднене' },
    { name: 'Heidingsfeld', lat: 49.7678, lng: 9.9456, desc: 'Незаконне звалище' },
    { name: 'Lengfeld', lat: 49.8123, lng: 9.9789, desc: 'Викиди в атмосферу' },
  ],
  vandalism: [
    { name: 'Alte Mainbrücke', lat: 49.7923, lng: 9.9312, desc: 'Графіті на історичному мосту' },
    { name: 'Marienkapelle', lat: 49.7939, lng: 9.9323, desc: 'Пошкоджена статуя' },
    { name: 'Grafeneckart', lat: 49.7934, lng: 9.9345, desc: 'Написи на стіні ратуші' },
    { name: 'Neubaukirche', lat: 49.7912, lng: 9.9378, desc: 'Вандалізм на фасаді' },
    { name: 'Augustinerkirche', lat: 49.7901, lng: 9.9334, desc: 'Розбиті вікна' },
  ],
};

// Generate random confidence score
function randomConfidence() {
  return (Math.random() * (0.99 - 0.75) + 0.75).toFixed(2);
}

// Generate random user ID from existing users
function randomUserId() {
  const users = [
    'usr_001', 'usr_002', 'usr_003', 'usr_004', 'usr_005',
    'usr_006', 'usr_007', 'usr_008', 'usr_009', 'usr_010'
  ];
  return users[Math.floor(Math.random() * users.length)];
}

// Generate timestamp (random in last 7 days)
function randomTimestamp() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

// Generate AI verdict
function generateAiVerdict(category) {
  return {
    is_issue: true,
    confidence: parseFloat(randomConfidence()),
    category: category,
    description: `AI detected ${category} issue`,
  };
}

// Generate reports
function generateReports() {
  const reports = [];
  let reportId = 1;

  Object.keys(LOCATIONS).forEach(deptId => {
    LOCATIONS[deptId].forEach(location => {
      const report = {
        id: `rpt_${deptId}_${String(reportId).padStart(3, '0')}`,
        authorId: randomUserId(),
        photoId: `data:image/jpeg;base64,PLACEHOLDER_PHOTO_${reportId}`,
        description: location.desc,
        latitude: location.lat,
        longitude: location.lng,
        aiVerdict: JSON.stringify(generateAiVerdict(deptId)),
        category: deptId,
        status: 'PENDING',
        forwardedTo: deptId,
        priority: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        createdAt: randomTimestamp(),
        updatedAt: randomTimestamp(),
      };

      reports.push(report);
      reportId++;
    });
  });

  return reports;
}

// Main execution
console.log('🚀 Generating test data for Würzburg departments...\n');

const reports = generateReports();

console.log(`✅ Generated ${reports.length} reports:\n`);

// Group by department
const byDept = {};
reports.forEach(report => {
  if (!byDept[report.category]) {
    byDept[report.category] = [];
  }
  byDept[report.category].push(report);
});

Object.keys(byDept).forEach(dept => {
  console.log(`${byDept[dept].length} reports for ${dept.toUpperCase()}`);
  byDept[dept].forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.description} at (${r.latitude}, ${r.longitude})`);
  });
  console.log('');
});

// Save to file
const outputPath = path.join(__dirname, 'test_reports_wuerzburg.json');
fs.writeFileSync(outputPath, JSON.stringify(reports, null, 2));

console.log(`💾 Saved to: ${outputPath}\n`);

// Generate SQL insert statements
console.log('📝 SQL INSERT statements:\n');
console.log('-- Copy and paste this into your database:\n');

reports.forEach(report => {
  console.log(`INSERT INTO Report (id, authorId, photoId, description, latitude, longitude, aiVerdict, category, status, forwardedTo, priority, createdAt, updatedAt) VALUES ('${report.id}', '${report.authorId}', '${report.photoId}', '${report.description.replace(/'/g, "''")}', ${report.latitude}, ${report.longitude}, '${report.aiVerdict}', '${report.category}', '${report.status}', '${report.forwardedTo}', '${report.priority}', '${report.createdAt}', '${report.updatedAt}');`);
});

console.log('\n✅ Done!');
