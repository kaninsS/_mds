const http = require('http');

async function test() {
  const loginData = JSON.stringify({ email: "admin_dd@admin.com", password: "password" });
  
  const loginRes = await fetch('http://localhost:8000/api/vendors/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  });
  // Wait, the login endpoint might be different. Let me just query the graph directly for the vendor's orders.
}
test();
