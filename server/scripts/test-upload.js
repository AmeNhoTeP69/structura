const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration - adjust these based on your local setup
const API_BASE_URL = 'http://localhost:5001/api';
const PROJECT_ID = '1'; // Assuming project 1 exists from seed
const AUTH_TOKEN = 'YOUR_TOKEN_HERE'; // You'd need a real token for this to work in a real test

async function testUpload() {
  const form = new FormData();
  form.append('fileName', 'Test_Asset_Script');
  form.append('documentType', 'OTHER');
  form.append('visibility', 'all');
  
  // Create a dummy file
  const dummyPath = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(dummyPath, 'Hello from diagnostic script');
  
  form.append('file', fs.createReadStream(dummyPath));

  console.log(`Attempting upload to ${API_BASE_URL}/projects/${PROJECT_ID}/documents...`);

  try {
    const response = await axios.post(`${API_BASE_URL}/projects/${PROJECT_ID}/documents`, form, {
      headers: {
        ...form.getHeaders(),
        // Authorization: `Bearer ${AUTH_TOKEN}`, // Uncomment and provide token if testing with auth
      },
    });
    console.log('Upload Success:', response.data);
  } catch (error) {
    console.error('Upload Failed:', error.response ? error.response.data : error.message);
  } finally {
    if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
  }
}

// testUpload(); // Uncomment to run if dependencies are installed
console.log('Diagnostic script ready. Install axios and form-data to run.');
