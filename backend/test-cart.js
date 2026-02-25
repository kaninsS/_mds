const fetch = require('node-fetch');
(async () => {
  const pk = "pk_81aff166b18fded7b325c051c8bbb573fe3e5457632ea17cca2fa0e3b1ad202f";
  const res = await fetch("http://localhost:9000/store/carts", {
    method: "POST",
    headers: {
      "x-publishable-api-key": pk,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: "test@example.com", currency_code: "thb" })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
