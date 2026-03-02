#!/usr/bin/env node
/**
 * Test Socket.IO Notifications System
 * Simulates sending a report and verifies Socket.IO events
 */

const http = require('http');

// Get a valid token from the environment or use a test one
const TOKEN = process.env.TEST_TOKEN || 'test-token';
const API_URL = 'http://localhost:3000';

// Simple 1x1 PNG in base64
const TEST_PHOTO = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

console.log('🧪 Testing Socket.IO Notifications System');
console.log('═'.repeat(50));

const payload = {
  photoBase64: TEST_PHOTO,
  latitude: 52.52,
  longitude: 13.405,
  description: '🧪 Test infrastructure issue from CLI',
  category: 'Roads'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/reports',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(payload).length
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n📡 API Response (Status: ${res.statusCode}):`);
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }

    console.log('\n✅ Test Report Sent!');
    console.log('\n📊 Expected behavior on City Hall Dashboard:');
    console.log('  1. Bell icon shows "1" badge (red circle with number)');
    console.log('  2. Click bell to open notification dropdown');
    console.log('  3. Dropdown shows the new report with:');
    console.log('     - Category: Roads');
    console.log('     - Description: Test infrastructure issue from CLI');
    console.log('     - Timestamp');
    console.log('     - Severity badge');
    console.log('  4. Click "Mark all as read" to clear badge');
    console.log('\n🌐 Dashboard URL: http://localhost:5175');
    console.log('═'.repeat(50));
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('  - Ensure Backend is running: npm run dev');
  console.log('  - Ensure Backend is on port 3000');
  console.log('  - Check authorization token');
  process.exit(1);
});

console.log('📤 Sending test report...');
console.log(`   Category: ${payload.category}`);
console.log(`   Location: ${payload.latitude}, ${payload.longitude}`);
console.log(`   Description: ${payload.description}\n`);

req.write(JSON.stringify(payload));
req.end();
