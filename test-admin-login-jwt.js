const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin/login';

async function testAdminLoginWithJWT() {
  console.log('🧪 Testing Admin Login with JWT Tokens...\n');

  try {
    // Test admin login
    console.log('1. Testing admin login with JWT tokens...');
    const loginResponse = await axios.post(BASE_URL, {
      email: 'superadmin@example.com', // Replace with a valid admin email
      password: 'password123', // Replace with a valid admin password
    });

    console.log('✅ Admin login successful!');
    console.log('📊 Response structure:');
    console.log('  - Success:', loginResponse.data.success);
    console.log('  - Message:', loginResponse.data.message);
    console.log('  - Has accessToken:', !!loginResponse.data.data.accessToken);
    console.log('  - Has refreshToken:', !!loginResponse.data.data.refreshToken);
    console.log('  - User role:', loginResponse.data.data.user.role);
    console.log('  - User email:', loginResponse.data.data.user.email);

    // Test using the access token for authenticated request
    if (loginResponse.data.data.accessToken) {
      console.log('\n2. Testing authenticated request with JWT token...');
      
      const headers = {
        'Authorization': `Bearer ${loginResponse.data.data.accessToken}`,
        'Content-Type': 'application/json',
      };

      // Test a protected admin endpoint
      try {
        const protectedResponse = await axios.get('http://localhost:5000/api/admin/profile', { headers });
        console.log('✅ Authenticated request successful!');
        console.log('📊 Protected endpoint response:', protectedResponse.data.message);
      } catch (error) {
        if (error.response) {
          console.log('❌ Authenticated request failed:', error.response.data.message);
        } else {
          console.log('❌ Network error:', error.message);
        }
      }
    }

    console.log('\n🎉 Admin login with JWT tokens test completed!');
    console.log('\n📚 Updated Admin Login Response:');
    console.log(JSON.stringify(loginResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Admin login test failed:', error.response ? error.response.data : error.message);
  }
}

testAdminLoginWithJWT();
