
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        // 1. Register/Login
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering user ${email}...`);

        let token;
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName: 'Test User' })
        });

        if (regRes.ok) {
            const data = await regRes.json();
            token = data.token;
        } else {
            console.log('Register failed, status:', regRes.status);
            const text = await regRes.text();
            console.log('Response:', text);
            // Try login if register failed (e.g. 409 conflict, though we use timestamp so unlikely)
            // ...
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        console.log('Got token.');

        // 2. Bulk Add
        const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];
        console.log('Bulk adding 4 tickers...');
        const bulkRes = await fetch(`${API_URL}/favorites/bulk`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tickers })
        });
        const bulkData = await bulkRes.json();
        console.log('Bulk add response:', bulkData);

        // 3. Get Favorites
        console.log('Fetching favorites...');
        const getRes = await fetch(`${API_URL}/favorites`, { headers });
        const getData = await getRes.json();
        const favorites = getData.favorites;
        console.log(`Got ${favorites.length} favorites.`);
        favorites.forEach((f: any) => console.log(`- ID: ${f.id}, Ticker: ${f.ticker}`));

        if (favorites.length === 0) throw new Error('No favorites found!');

        // 4. Update the first one
        const first = favorites[0];
        console.log(`Updating favorite ${first.id} (${first.ticker})...`);
        const updateRes = await fetch(`${API_URL}/favorites/${first.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                averagePrice: 150.00,
                shares: 10
            })
        });
        const updateData = await updateRes.json();
        console.log('Update response:', updateData);

        // 5. Delete the first one
        console.log(`Deleting favorite ${first.id}...`);
        const deleteRes = await fetch(`${API_URL}/favorites/${first.id}`, {
            method: 'DELETE',
            headers
        });
        const deleteData = await deleteRes.json();
        console.log('Delete response:', deleteData);

        // 6. Verify Delete
        const getRes2 = await fetch(`${API_URL}/favorites`, { headers });
        const getData2 = await getRes2.json();
        const remaining = getData2.favorites;
        console.log(`Final count: ${remaining.length}`);

        // 7. Verify we can add duplicates?
        console.log('Trying to add duplicate AAPL...');
        const bulkRes2 = await fetch(`${API_URL}/favorites/bulk`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tickers: ['AAPL'] })
        });
        console.log('Duplicate add response:', await bulkRes2.json());

        const getRes3 = await fetch(`${API_URL}/favorites`, { headers });
        const getData3 = await getRes3.json();
        console.log(`Count after duplicate attempt: ${getData3.favorites.length}`);


    } catch (error: any) {
        console.error('Error:', error);
    }
}

run();
