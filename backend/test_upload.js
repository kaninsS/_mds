const fs = require('fs');
const http = require('http');

async function testUpload() {
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

            if (!token) {
                console.error("Login failed!", parsedData);
                return;
            }

            console.log("Got token! Uploading file...");

            const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
            let postData = '';
            postData += '--' + boundary + '\r\n';
            postData += 'Content-Disposition: form-data; name="files"; filename="test-image.png"\r\n';
            postData += 'Content-Type: image/png\r\n\r\n';
            // Mocking a tiny fake PNG file
            postData += 'fake-image-data\r\n';
            postData += '--' + boundary + '--\r\n';

            const reqUpload = http.request({
                hostname: 'localhost',
                port: 9000,
                path: '/vendors/me/upload',
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (resUpload) => {
                let uploadData = '';
                resUpload.on('data', (chunk) => uploadData += chunk);
                resUpload.on('end', () => {
                    console.log("Upload response status:", resUpload.statusCode);
                    console.log("Upload response:", uploadData);
                });
            });

            reqUpload.write(postData);
            reqUpload.end();
        });
    });

    req.write(loginData);
    req.end();
}

testUpload();
