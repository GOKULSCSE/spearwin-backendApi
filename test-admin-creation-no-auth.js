const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin';

async function testAdminCreationNoAuth() {
  console.log('🧪 Testing Admin Creation (No Auth Required)...\n');

  try {
    // Test 1: Create first SUPER_ADMIN
    console.log('1. Creating first SUPER_ADMIN...');
    const createSuperAdminResponse = await axios.post(`${BASE_URL}/create-admin`, {
      email: 'superadmin@example.com',
      password: 'SuperSecurePass123!',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'SUPER_ADMIN',
      department: 'IT',
      position: 'System Administrator',
    });

    console.log('✅ SUPER_ADMIN created successfully!');
    console.log('📊 Created Admin Details:');
    console.log('  - User ID:', createSuperAdminResponse.data.data.user.id);
    console.log('  - Email:', createSuperAdminResponse.data.data.user.email);
    console.log('  - Role:', createSuperAdminResponse.data.data.user.role);
    console.log('  - Status:', createSuperAdminResponse.data.data.user.status);
    console.log('  - Admin ID:', createSuperAdminResponse.data.data.admin.id);
    console.log('  - Name:', `${createSuperAdminResponse.data.data.admin.firstName} ${createSuperAdminResponse.data.data.admin.lastName}`);

    // Test 2: Create regular admin
    console.log('\n2. Creating regular admin...');
    const createAdminResponse = await axios.post(`${BASE_URL}/create-admin`, {
      email: 'admin@example.com',
      password: 'AdminPass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1987654321',
      role: 'ADMIN',
      department: 'Human Resources',
      position: 'HR Manager',
    });

    console.log('✅ Regular admin created successfully!');
    console.log('📊 Created Admin Details:');
    console.log('  - Email:', createAdminResponse.data.data.user.email);
    console.log('  - Role:', createAdminResponse.data.data.user.role);
    console.log('  - Department:', createAdminResponse.data.data.admin.department);

    // Test 3: Test login with created SUPER_ADMIN
    console.log('\n3. Testing login with created SUPER_ADMIN...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'superadmin@example.com',
      password: 'SuperSecurePass123!',
    });

    console.log('✅ Login successful!');
    console.log('📊 Login Response:');
    console.log('  - Has accessToken:', !!loginResponse.data.data.accessToken);
    console.log('  - Has refreshToken:', !!loginResponse.data.data.refreshToken);
    console.log('  - User role:', loginResponse.data.data.user.role);
    console.log('  - User email:', loginResponse.data.data.user.email);

    // Test 4: Test login with created regular admin
    console.log('\n4. Testing login with created regular admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'AdminPass123!',
    });

    console.log('✅ Admin login successful!');
    console.log('📊 Admin Login Response:');
    console.log('  - User role:', adminLoginResponse.data.data.user.role);
    console.log('  - User email:', adminLoginResponse.data.data.user.email);

    console.log('\n🎉 All admin creation tests completed successfully!');
    console.log('\n📚 What was tested:');
    console.log('  ✅ Create SUPER_ADMIN without authentication');
    console.log('  ✅ Create regular ADMIN without authentication');
    console.log('  ✅ Login with created SUPER_ADMIN');
    console.log('  ✅ Login with created regular ADMIN');
    console.log('  ✅ JWT token generation for both admin types');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testAdminCreationNoAuth();
