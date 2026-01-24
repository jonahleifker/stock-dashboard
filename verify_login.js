
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('Testing User Login...');

        const email = 'jonahleifker@gmail.com';
        const password = 'Jonah0606!';

        const res = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Login SUCCESS!');
            console.log('Token received:', !!data.accessToken);
        } else {
            console.log('Login FAILED:', res.status, await res.text());
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
