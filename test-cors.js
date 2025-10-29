const https = require('https');
const http = require('http');

// Test CORS configuration
function testCORS() {
  const options = {
    hostname: 'backend.spearwin.com',
    port: 443,
    path: '/api/admin/login',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://admin.spearwin.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
  };

  console.log('Testing CORS preflight request...');
  console.log('Request headers:', options.headers);

  const req = https.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:');
    Object.keys(res.headers).forEach(key => {
      console.log(`  ${key}: ${res.headers[key]}`);
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', data);
      console.log('CORS test completed');
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test actual POST request
function testPOST() {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  });

  const options = {
    hostname: 'backend.spearwin.com',
    port: 443,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'https://admin.spearwin.com',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    }
  };

  console.log('\nTesting actual POST request...');
  console.log('Request headers:', options.headers);

  const req = https.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:');
    Object.keys(res.headers).forEach(key => {
      console.log(`  ${key}: ${res.headers[key]}`);
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', data);
      console.log('POST test completed');
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(postData);
  req.end();
}

// Run tests
testCORS();
setTimeout(testPOST, 2000);
