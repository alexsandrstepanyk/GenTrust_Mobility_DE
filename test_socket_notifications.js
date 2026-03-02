#!/usr/bin/env node
/**
 * Complete Socket.IO Notification System Test
 * Tests both Socket.IO connection and REST API report submission
 */

const io = require('socket.io-client');
const http = require('http');

const API_URL = 'http://localhost:3000';
const TEST_TOKEN = 'test-admin-token';

// Simple 1x1 PNG
const TEST_PHOTO = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

let testsPassed = 0;
let testsFailed = 0;

function logTest(title) {
  console.log(`\n📝 Test: ${title}`);
  console.log('─'.repeat(50));
}

function logPass(message) {
  console.log(`  ✅ ${message}`);
  testsPassed++;
}

function logFail(message) {
  console.log(`  ❌ ${message}`);
  testsFailed++;
}

console.log('\n🧪 GenTrust Socket.IO Notifications System Test');
console.log('═'.repeat(50));

// Test 1: Check API health
logTest('API Health Check');
const healthReq = http.request('http://localhost:3000/api/health', (res) => {
  if (res.statusCode === 200) {
    logPass('Backend API is running on port 3000');
  } else {
    logFail(`Backend returned status ${res.statusCode}`);
  }

  // Test 2: Socket.IO Connection
  logTest('Socket.IO Connection');
  const socket = io(API_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 3,
    auth: {
      token: TEST_TOKEN
    },
    transports: ['websocket', 'polling']
  });

  let socketConnected = false;
  let reportNotificationReceived = false;

  socket.on('connect', () => {
    logPass('Socket.IO connected successfully');
    socketConnected = true;
    
    // Subscribe to reports
    socket.emit('report:subscribe');
    logPass('Subscribed to reports room');
  });

  socket.on('report:new', (data) => {
    logPass('Received report:new event via Socket.IO');
    console.log(`     Report ID: ${data.id}`);
    console.log(`     Category: ${data.category}`);
    console.log(`     Severity: ${data.severity}`);
    console.log(`     Timestamp: ${data.timestamp}`);
    reportNotificationReceived = true;
  });

  socket.on('connected', (data) => {
    logPass(`Server confirmed connection: ${data.message}`);
  });

  socket.on('connect_error', (error) => {
    logFail(`Socket.IO connection error: ${error.message}`);
  });

  socket.on('disconnect', (reason) => {
    logPass(`Socket.IO disconnected: ${reason}`);
  });

  // Wait a moment and then send test report via REST API
  setTimeout(() => {
    logTest('REST API Report Submission');
    
    const payload = {
      photoBase64: TEST_PHOTO,
      latitude: 52.52,
      longitude: 13.405,
      description: '🧪 Automated test report from Socket.IO test suite',
      category: 'Roads'
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/reports',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
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
        if (res.statusCode === 201) {
          logPass('Report created successfully (HTTP 201)');
          const response = JSON.parse(data);
          console.log(`     Report ID: ${response.report?.id}`);
        } else {
          logFail(`Report submission failed with status ${res.statusCode}`);
        }

        // Wait for Socket.IO event
        setTimeout(() => {
          logTest('Socket.IO Event Reception');
          if (reportNotificationReceived) {
            logPass('Report notification received via Socket.IO');
          } else {
            logFail('Did not receive report:new event');
          }

          // Final summary
          console.log('\n' + '═'.repeat(50));
          console.log(`📊 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
          
          if (testsFailed === 0) {
            console.log('✅ All tests passed! Notification system is working.');
            console.log('\n🎯 Next steps:');
            console.log('  1. Open City Hall Dashboard: http://localhost:5175');
            console.log('  2. Look for bell icon with "1" badge');
            console.log('  3. Click bell to see notification dropdown');
            console.log('  4. Verify notification shows Roads category');
          } else {
            console.log('⚠️  Some tests failed. Check the output above.');
          }

          console.log('═'.repeat(50) + '\n');
          
          socket.disconnect();
          process.exit(testsFailed === 0 ? 0 : 1);
        }, 2000);
      });
    });

    req.on('error', (error) => {
      logFail(`Report submission error: ${error.message}`);
      socket.disconnect();
      process.exit(1);
    });

    req.write(JSON.stringify(payload));
    req.end();
  }, 1000);
});

healthReq.on('error', (error) => {
  logFail(`Cannot reach backend: ${error.message}`);
  console.log('\n💡 Troubleshooting:');
  console.log('  1. Start backend: cd /path/to/project && npm run dev');
  console.log('  2. Ensure port 3000 is free');
  console.log('  3. Wait 10 seconds for full startup');
  console.log('═'.repeat(50) + '\n');
  process.exit(1);
});

healthReq.end();

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n⏱️  Test timeout (30 seconds)');
  process.exit(1);
}, 30000);
