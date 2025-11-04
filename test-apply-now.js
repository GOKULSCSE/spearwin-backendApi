const axios = require('axios');

async function testApply() {
  try {
    console.log('Testing job application with all fields...\n');
    
    // You need to replace this with your actual auth token
    const token = 'YOUR_AUTH_TOKEN_HERE';
    
    const response = await axios.post(
      'http://localhost:5000/jobs/cmhd1yi0d0003f0iwmf9m3owh/apply',
      {
        fullName: "Gokul S",
        email: "gokul03903@gmail.com",
        phone: "09345466160",
        location: "Coimbatore",
        experienceLevel: "Entry Level (0-2 years)",
        noticePeriod: "23",
        currentCTC: "12",
        expectedCTC: "23",
        javaExperience: "Yes, I have 5+ years of Java experience",
        locationPreference: "Yes, I am looking for Coimbatore location",
        coverLetter: "Application from Gokul S for the position."
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('\nApplication created:');
    console.log('ID:', response.data.id);
    console.log('Job ID:', response.data.jobId);
    console.log('Status:', response.data.status);
    console.log('\nContact Info:');
    console.log('Name:', response.data.fullName);
    console.log('Email:', response.data.email);
    console.log('Phone:', response.data.phone);
    console.log('\nAdditional Details:');
    console.log('Current CTC:', response.data.currentCTC);
    console.log('Expected CTC:', response.data.expectedCTC);
    console.log('Notice Period:', response.data.noticePeriod);
    
  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n⚠️  You need a valid auth token!');
        console.error('Get your token by logging in to the frontend.');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApply();

