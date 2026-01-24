
const API_URL = 'http://localhost:6405/api';

async function run() {
    try {
        console.log('Verifying Profile Update Fix...');

        // 1. Login
        const email = 'jonahleifker@gmail.com';
        const password = 'Jonah0606!';

        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:6405/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        if (!loginRes.ok) {
            console.log('Login failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('Login successful. Token:', token ? token.substring(0, 15) + '...' : 'UNDEFINED');

        // 2. Update Profile
        const newPic = 'https://example.com/verified-pic.jpg';
        console.log('Sending PUT /api/auth/me...');

        const updateRes = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profilePicture: newPic })
        });

        if (updateRes.ok) {
            const data = await updateRes.json();
            console.log('Update SUCCESS!');
            console.log('New Profile Picture:', data.user.profilePicture);
        } else {
            console.log('Update FAILED:', updateRes.status, await updateRes.text());
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
