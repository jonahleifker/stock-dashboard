
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('Testing Profile Update...');

        // 1. Login to get token
        const email = 'jonahleifker@gmail.com';
        const password = 'Jonah0606!';

        const loginRes = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        if (!loginRes.ok) {
            console.log('Login failed during reproduction:', loginRes.status);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        // 2. Try Update
        const newPic = 'https://example.com/test-pic.jpg';
        console.log('Sending PUT /api/auth/me...');

        const updateRes = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profilePicture: newPic })
        });

        const text = await updateRes.text();
        console.log(`Status: ${updateRes.status}`);
        console.log(`Response: ${text}`);

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
