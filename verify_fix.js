
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('Testing Delete Fix...');

        // 1. Register/Login to get token
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName: 'Test User' })
        });

        if (!regRes.ok) throw new Error('Register failed: ' + await regRes.text());
        const { token } = await regRes.json();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Add one favorite
        const addRes = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ticker: 'TEST' })
        });
        const { favorite } = await addRes.json();
        console.log(`Added favorite ID: ${favorite.id}`);

        // 3. Delete it
        console.log('Attemping DELETE...');
        const delRes = await fetch(`${API_URL}/favorites/${favorite.id}`, {
            method: 'DELETE',
            headers
        });

        if (delRes.ok) {
            console.log('DELETE SUCCESS:', await delRes.json());
        } else {
            console.log('DELETE FAILED:', delRes.status, await delRes.text());
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
