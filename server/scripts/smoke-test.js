/* eslint-disable no-console */
const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:5001';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log(`Running smoke tests against ${baseUrl}`);

  const health = await request('/api/health');
  assert(health.response.ok, 'Healthcheck failed');
  assert(health.payload?.success === true, 'Health payload malformed');

  const invalidContact = await request('/api/public/contact-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'A',
      email: 'bad-email',
      message: 'short',
    }),
  });
  assert(invalidContact.response.status === 400, 'Invalid contact message should be rejected');

  const login = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@structura.com',
      password: 'password123',
    }),
  });
  assert(login.response.ok, 'Admin login failed');
  const token = login.payload?.data?.token;
  assert(token, 'Admin token missing');

  const notifications = await request('/api/notifications?limit=5', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert(notifications.response.ok, 'Notifications endpoint failed');
  assert(Array.isArray(notifications.payload?.data), 'Notifications payload malformed');

  const siteContent = await request('/api/admin/site-content/home', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert(siteContent.response.ok, 'Admin site content endpoint failed');
  assert(siteContent.payload?.data?.heroTitle, 'Site content payload malformed');

  console.log('Smoke tests passed.');
}

main().catch((error) => {
  console.error('Smoke tests failed.');
  console.error(error);
  process.exit(1);
});
