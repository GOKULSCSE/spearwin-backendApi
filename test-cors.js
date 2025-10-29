const https = require('https');

// Test CORS preflight request
const options = {
  hostname: 'backend.spearwin.com',
  port: 443,
  path: '/api/admin/login',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://admin.spearwin.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
  }
};

console.log('Testing CORS preflight request...');
console.log('Request details:', options);

const req = https.request(options, (res) => {
  console.log('Response status:', res.statusCode);
  console.log('Response headers:', res.headers);
  
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
  console.error('Request error:', error);
});

req.end();
