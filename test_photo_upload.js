const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Helper to generate a large base64 string (approx 2MB)
const generateLargeBase64 = () => {
    const sizeInBytes = 2 * 1024 * 1024; // 2MB
    return Buffer.alloc(sizeInBytes).toString('base64');
};

const runTest = async () => {
    try {
        // 1. Create a unique user for testing
        const uniqueId = Math.random().toString(36).substring(7);
        const email = `test_user_${uniqueId}@example.com`;
        const password = 'testpassword123';
        const firstName = `TestUser_${uniqueId}`;

        console.log(`\n--- Starting Backend Verification Test ---`);
        console.log(`Target API: ${API_URL}`);

        console.log(`\n1. Registering new user: ${email}`);
        await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            firstName,
            district: 'Mitte', // Default values
            birthDate: '2000-01-01',
            school: 'Test School',
            grade: '10'
        });
        console.log('✓ Registration successful');

        // 2. Login to get token
        console.log(`\n2. Logging in with new user...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.token;

        if (!token) {
            throw new Error('Login successful but no token received!');
        }
        console.log('✓ Login successful, token received');

        // 3. Prepare large payload
        console.log(`\n3. Preparing large photo payload (~2MB Base64)...`);
        const largePhotoBase64 = generateLargeBase64();

        // 4. Submit report
        console.log(`\n4. Submitting report with large payload...`);
        const reportRes = await axios.post(`${API_URL}/reports`, {
            photoBase64: largePhotoBase64,
            latitude: 52.5200,
            longitude: 13.4050,
            description: 'Automated test report with large payload'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✓ Report submitted successfully!');
        console.log(`Report ID: ${reportRes.data.report.id}`);

        console.log(`\n✅ BACKEND VERIFICATION PASSED: API accepts large photo uploads.`);

    } catch (error) {
        console.error(`\n❌ TEST FAILED:`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
};

runTest();
