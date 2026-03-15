async function testLoginFetch() {
  const username = 'admin'; // Testing with admin
  const password = 'admin'; // I recall admin/admin or similar was used before
  
  try {
    console.log(`Attempting login for ${username}...`);
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Fetch failed:', error.message);
  }
}

testLoginFetch();
