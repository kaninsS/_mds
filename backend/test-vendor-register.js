const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:9000/store/vendor-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: 'test_123',
      invite_token: 'test_token'
    })
  });
  console.log(res.status);
  const json = await res.json();
  console.log(json);
}

test();
