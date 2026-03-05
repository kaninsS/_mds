const http = require('http');

async function testGetProducts() {
    const loginData = JSON.stringify({
        email: 'kaninsorn27+1771921075@gmail.com',
        password: 'password'
    });

    const req = http.request({
        hostname: 'localhost',
        port: 9000,
        path: '/auth/vendor/emailpass',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            const parsedData = JSON.parse(rawData);
            const token = parsedData.token;

            // Get products
            const req2 = http.request({
                hostname: 'localhost',
                port: 9000,
                path: '/vendors/me/products',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            }, (res2) => {
                let rawData2 = '';
                res2.on('data', (chunk) => { rawData2 += chunk; });
                res2.on('end', () => {
                    console.log("Get products response:", res2.statusCode);
                    console.log(rawData2);
                });
            });

            req2.end();
        });
    });

    req.write(loginData);
    req.end();
}

testGetProducts();
