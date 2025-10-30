const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test script for image upload functionality
const BASE_URL = 'http://localhost:5000';

async function testImageUpload() {
  try {
    console.log('Testing Image Upload Module...\n');

    // First, let's test if the server is running
    try {
      const healthCheck = await axios.get(`${BASE_URL}/`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('Run: npm run start:dev');
      return;
    }

    // Note: These tests require authentication
    console.log('\n📝 Note: These tests require JWT authentication.');
    console.log('You need to login first and get a JWT token to test the endpoints.');
    console.log('\nAvailable endpoints:');
    console.log('POST /image-upload/single - Upload single image');
    console.log('POST /image-upload/multiple - Upload multiple images');
    console.log('DELETE /image-upload - Delete image');
    console.log('GET /image-upload/presigned-url - Get presigned URL');
    console.log('GET /image-upload/url/:key - Get image URL');
    
    console.log('\nExample usage with curl:');
    console.log('curl -X POST http://localhost:5000/image-upload/single \\');
    console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
    console.log('  -F "image=@/path/to/your/image.jpg" \\');
    console.log('  -F "folder=test-images"');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testImageUpload();
