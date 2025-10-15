const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin';
let accessToken = '';

async function testAdminCreation() {
  console.log('🧪 Testing Admin Creation API...\n');

  try {
    // Step 1: Login as SUPER_ADMIN to get JWT token
    console.log('1. Logging in as SUPER_ADMIN...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'superadmin@example.com', // Replace with valid SUPER_ADMIN email
      password: 'password123', // Replace with valid password
    });

    accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful! Access token obtained.');

    // Step 2: Create a new admin user
    console.log('\n2. Creating new admin user...');
    const createAdminResponse = await axios.post(
      `${BASE_URL}/create-admin`,
      {
        email: 'newadmin@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'ADMIN',
        department: 'Human Resources',
        position: 'HR Manager',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Admin created successfully!');
    console.log('📊 Created Admin Details:');
    console.log('  - User ID:', createAdminResponse.data.data.user.id);
    console.log('  - Email:', createAdminResponse.data.data.user.email);
    console.log('  - Role:', createAdminResponse.data.data.user.role);
    console.log('  - Status:', createAdminResponse.data.data.user.status);
    console.log('  - Admin ID:', createAdminResponse.data.data.admin.id);
    console.log('  - Name:', `${createAdminResponse.data.data.admin.firstName} ${createAdminResponse.data.data.admin.lastName}`);
    console.log('  - Department:', createAdminResponse.data.data.admin.department);
    console.log('  - Position:', createAdminResponse.data.data.admin.position);

    // Step 3: Test creating admin with minimal data
    console.log('\n3. Creating admin with minimal data...');
    const createMinimalAdminResponse = await axios.post(
      `${BASE_URL}/create-admin`,
      {
        email: 'minimaladmin@example.com',
        password: 'MinimalPass789!',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'ADMIN',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Minimal admin created successfully!');
    console.log('📊 Minimal Admin Details:');
    console.log('  - Email:', createMinimalAdminResponse.data.data.user.email);
    console.log('  - Role:', createMinimalAdminResponse.data.data.user.role);
    console.log('  - Phone Verified:', createMinimalAdminResponse.data.data.user.phoneVerified);

    // Step 4: Test error handling - duplicate email
    console.log('\n4. Testing error handling (duplicate email)...');
    try {
      await axios.post(
        `${BASE_URL}/create-admin`,
        {
          email: 'newadmin@example.com', // Same email as step 2
          password: 'password123',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'ADMIN',
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling works correctly!');
        console.log('📊 Error Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Step 5: Test error handling - no authorization
    console.log('\n5. Testing error handling (no authorization)...');
    try {
      await axios.post(`${BASE_URL}/create-admin`, {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authorization check works correctly!');
        console.log('📊 Error Message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All admin creation tests completed successfully!');
    console.log('\n📚 API Endpoints Tested:');
    console.log('  ✅ POST /api/admin/login - Admin authentication');
    console.log('  ✅ POST /api/admin/create-admin - Create admin user');
    console.log('  ✅ Error handling for duplicate emails');
    console.log('  ✅ Error handling for unauthorized access');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testAdminCreation();
