async function testAuth() {
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    console.log(`1. Registering user: ${testEmail}`);
    const regRes = await fetch('http://localhost:9000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: testEmail,
        password: testPassword,
        role: 'admin'
      })
    });
    const regData = await regRes.json();
    console.log('Register success:', regData.success);
    
    if (!regData.success) {
      console.log('Register error:', regData);
      return;
    }
    
    console.log(`2. Logging in as user: ${testEmail}`);
    const loginRes = await fetch('http://localhost:9000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        role: 'admin'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login success:', loginData.success);
    if (!loginData.success) {
      console.log('Login error:', loginData);
    } else {
      console.log('Token received:', !!loginData.token);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();
