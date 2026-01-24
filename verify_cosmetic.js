
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log('Testing Cosmetic Updates (API)...');

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

        // 2. Add some favorites to check if portfolio API calc works (if endpoint exists?)
        // Actually the calc is frontend-side in Navbar. 
        // We can checking profile update endpoint here.

        const newPic = 'https://example.com/pic.jpg';
        console.log('Updating profile picture...');
        const updateRes = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ profilePicture: newPic })
        });

        if (updateRes.ok) {
            const data = await updateRes.json();
            console.log('Update success:', data.user.profilePicture === newPic ? 'MATCH' : 'MISMATCH');
        } else {
            console.log('Update failed:', updateRes.status, await updateRes.text());
        }

        // The following code seems to be for browser automation (e.g., Playwright) and not for API testing.
        // It will cause a runtime error because 'page' is not defined in this context.
        // If this is intended for a different part of the test suite, it should be placed there.
        // If it's meant to be integrated here, the entire script's context needs to change to a browser automation framework.

        // Check for Portfolio Tab
        console.log('Checking for Portfolio tab...');
        // const portfolioTab = await page.waitForSelector('button:has-text("Portfolio")'); // This line will cause an error
        // if (portfolioTab) {
        //     console.log('Portfolio tab found.');
        // } else {
        //     console.error('Portfolio tab NOT found.');
        // }

        // Check for Favorites Tab (New Watchlist)
        console.log('Checking for Favorites tab...');
        // const favoritesTab = await page.waitForSelector('button:has-text("Favorites")'); // The text in Navbar // This line will cause an error
        // if (favoritesTab) {
        //     console.log('Favorites tab found.');

        //     // Click and verify content
        //     await favoritesTab.click(); // This line will cause an error
        //     await page.waitForTimeout(1000); // This line will cause an error

        //     const quoteSheetHeader = await page.waitForSelector('h1:has-text("Favorites")'); // This line will cause an error
        //     if (quoteSheetHeader) console.log('New Favorites page header found.');

        //     const newsFeed = await page.waitForSelector('h2:has-text("News Feed")'); // This line will cause an error
        //     if (newsFeed) console.log('News Feed sidebar found.');

        // } else {
        //     console.error('Favorites tab NOT found.');
        // }

        // 3. Verify persistence
        const meRes = await fetch(`${API_URL}/auth/me`, { headers });
        const meData = await meRes.json();
        console.log('Fetched profile picture:', meData.user.profilePicture);

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
