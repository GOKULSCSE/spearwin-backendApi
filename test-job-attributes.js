const axios = require('axios');

const baseURL = 'http://localhost:5000/api/jobs';

async function testJobAttributesAPI() {
  console.log('🧪 Testing Job Attributes API...\n');

  try {
    // Test 1: Get all job attributes by category
    console.log('Test 1: Get job attributes by category');
    try {
      const response = await axios.get(`${baseURL}/attributes/categories`);
      console.log('✅ Success:', response.data.message);
      console.log(`📊 Found ${response.data.data.length} categories`);
      response.data.data.forEach(category => {
        console.log(`  ${category.category}: ${category.attributes.length} attributes`);
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get job attributes with filters
    console.log('Test 2: Get job attributes with filters');
    try {
      const response = await axios.get(`${baseURL}/attributes?category=JOB_SKILL&isActive=true&limit=10`);
      console.log('✅ Success:', response.data.message);
      console.log(`📊 Found ${response.data.data.length} job skills`);
      response.data.data.forEach(skill => {
        console.log(`  - ${skill.name}`);
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Search job attributes
    console.log('Test 3: Search job attributes');
    try {
      const response = await axios.get(`${baseURL}/attributes?search=React&category=JOB_SKILL`);
      console.log('✅ Success:', response.data.message);
      console.log(`📊 Found ${response.data.data.length} matching skills`);
      response.data.data.forEach(skill => {
        console.log(`  - ${skill.name}`);
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Get all job attributes (paginated)
    console.log('Test 4: Get all job attributes (paginated)');
    try {
      const response = await axios.get(`${baseURL}/attributes?page=1&limit=5&sortBy=name&sortOrder=asc`);
      console.log('✅ Success:', response.data.message);
      console.log(`📊 Page ${response.data.pagination.page} of ${response.data.pagination.totalPages}`);
      console.log(`📊 Showing ${response.data.data.length} of ${response.data.pagination.total} attributes`);
      response.data.data.forEach(attr => {
        console.log(`  - ${attr.name} (${attr.category})`);
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Get specific category attributes
    console.log('Test 5: Get specific category attributes');
    const categories = ['LANGUAGE_LEVEL', 'CAREER_LEVEL', 'FUNCTIONAL_AREA', 'GENDER', 'INDUSTRY', 'JOB_EXPERIENCE', 'JOB_SKILL', 'JOB_TYPE', 'JOB_SHIFT', 'DEGREE_LEVEL', 'DEGREE_TYPE', 'MAJOR_SUBJECT'];
    
    for (const category of categories.slice(0, 3)) { // Test first 3 categories
      try {
        const response = await axios.get(`${baseURL}/attributes?category=${category}&isActive=true`);
        console.log(`${category}: ${response.data.data.length} attributes`);
        response.data.data.forEach(attr => {
          console.log(`  - ${attr.name}`);
        });
      } catch (error) {
        console.log(`${category}: Error -`, error.response?.data || error.message);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 6: Test authentication required endpoints (should fail without token)
    console.log('Test 6: Test authentication required endpoints');
    try {
      const response = await axios.post(`${baseURL}/attributes`, {
        name: 'Python Programming',
        category: 'JOB_SKILL',
        description: 'Python programming language skills',
        sortOrder: 5
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error (expected without auth):', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📚 Available API Endpoints:');
    console.log('  GET    /api/jobs/attributes/categories    - Get attributes by category');
    console.log('  GET    /api/jobs/attributes              - Get attributes with filters');
    console.log('  GET    /api/jobs/attributes/:id          - Get specific attribute');
    console.log('  POST   /api/jobs/attributes              - Create attribute (requires auth)');
    console.log('  PUT    /api/jobs/attributes/:id          - Update attribute (requires auth)');
    console.log('  DELETE /api/jobs/attributes/:id          - Delete attribute (requires auth)');
    console.log('  POST   /api/jobs/attributes/bulk         - Bulk create attributes (requires auth)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJobAttributesAPI().catch(console.error);
