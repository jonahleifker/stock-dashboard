# Stock Dashboard v2 - User Guide

## How to Add Notes for a Stock

Notes are **user-specific** research notes where you can track your bull/bear cases for each stock.

### Steps to Add a Note:

1. **Navigate to Quotes Page**
   - Go to `/quotes` or click "Quotes" in the navigation
   - You'll see a list of all tracked stocks

2. **Click on Any Stock Ticker**
   - Click on any ticker symbol (e.g., `AAPL`, `TSLA`, `MSFT`)
   - This opens the Company Dashboard for that stock

3. **Find the Research Notes Section**
   - On the Company Dashboard page, look for the **"Research Notes"** collapsible section
   - It's in the main content area on the left side

4. **Click "Add Note" Button**
   - Opens a form with four fields:
     - **Bull Case**: Why the stock could go up
     - **Bear Case**: Risks and concerns
     - **Buy-in Price Target**: Your ideal entry price
     - **Current Stance**: Bullish, Bearish, or Neutral

5. **Fill Out the Form and Click "Save Note"**
   - Your note will appear below with your username/avatar
   - Only you can delete your own notes
   - Other users' notes are visible but can't be deleted by you

### Example URLs to Test:
- Apple: `http://localhost:3000/company/AAPL`
- Tesla: `http://localhost:3000/company/TSLA`
- Microsoft: `http://localhost:3000/company/MSFT`

---

## How to Add Favorites (Portfolio)

Favorites are your portfolio holdings where you can track positions with entry price and share count.

### Steps to Add Favorites:

1. **Navigate to Portfolio Page**
   - Go to `/portfolio` or click "Portfolio" in navigation
   - This is your main portfolio view

2. **Click "Bulk Add" or "Add Stock" Button**
   - **Bulk Add**: Add multiple tickers at once (comma-separated)
   - **Add Stock**: Add one stock with details (price, shares)

3. **Enter Stock Information**
   - **Ticker**: Stock symbol (e.g., AAPL)
   - **Average Price** (optional): Your average cost basis
   - **Shares** (optional): Number of shares you own

4. **View Your Portfolio**
   - See current value vs. your cost basis
   - Track gain/loss percentage
   - View performance over time

---

## How to Add Watchlist Items

Watchlist is for stocks you're interested in but don't own yet.

### Steps to Add to Watchlist:

1. **Navigate to Dashboard Page**
   - Go to `/dashboard` or click "Dashboard" in navigation
   - This shows your watchlist

2. **Click "Add to Watchlist" Button**
   - Enter the ticker symbol
   - Click "Add"

3. **View Watchlist**
   - See all stocks you're watching
   - Monitor their performance
   - Remove stocks when no longer interested

---

## User-Specific Data

All the following are **scoped to your logged-in user**:

| Feature | Description | Location |
|---------|-------------|----------|
| **Notes** | Research notes (bull/bear cases) | Company Dashboard (`/company/:ticker`) |
| **Favorites** | Your portfolio holdings | Portfolio Page (`/portfolio`) |
| **Watchlist** | Stocks you're monitoring | Dashboard Page (`/dashboard`) |
| **Articles** | Saved article links | Company Dashboard (`/company/:ticker`) |

### Testing User Separation

To verify user data is properly separated:

1. **Login as User A** (e.g., Willy5x)
   - Add some notes, favorites, watchlist items

2. **Logout**
   - Click logout button in navigation

3. **Register/Login as User B** (new user)
   - Check that you don't see User A's data
   - Add your own notes/favorites
   - They should be separate from User A

4. **Login Back as User A**
   - Your original data should still be there
   - User B's data should not be visible

---

## Authentication Testing Checklist

### ✅ Basic Auth Flow
- [ ] Visit root `/` when not logged in → redirects to `/login`
- [ ] Register new user → auto-login → redirect to `/portfolio`
- [ ] Logout → redirect to `/login`
- [ ] Login with existing user → redirect to `/portfolio`

### ✅ Protected Routes
- [ ] Try accessing `/portfolio` without login → redirects to `/login`
- [ ] Try accessing `/quotes` without login → redirects to `/login`
- [ ] Try accessing `/company/AAPL` without login → redirects to `/login`

### ✅ Session Persistence
- [ ] Login → refresh page → still logged in
- [ ] Login → close browser → reopen → still logged in (tokens in localStorage)
- [ ] Logout → tokens cleared from localStorage

### ✅ User Data Separation
- [ ] Add notes as User A → login as User B → can't see User A's notes
- [ ] Add favorites as User A → login as User B → separate portfolios
- [ ] Each user sees only their own data

---

## Navigation Structure

```
Login/Register (Public)
├── /login
└── /register

Main App (Protected - requires authentication)
├── / → redirects to /portfolio
├── /portfolio → Your holdings (favorites)
├── /dashboard → Your watchlist
├── /quotes → All stocks list
├── /company/:ticker → Individual stock page
│   ├── Research Notes section (add notes here)
│   ├── Articles section
│   └── Fundamentals
├── /research → Research hub
└── /matrix → Ticker matrix view
```

---

## Troubleshooting

### Issue: Can't access protected pages
**Solution**: Make sure you're logged in. Check browser console for auth errors.

### Issue: Stuck on loading screen
**Solution**: 
1. Check that backend is running on port 6405
2. Clear localStorage and try logging in again
3. Check browser console for errors

### Issue: Token expired
**Solution**: The app should auto-refresh your token. If it fails, you'll be logged out automatically.

### Issue: Don't see my data after login
**Solution**: 
1. Make sure you're logged in as the correct user
2. Check browser console for API errors
3. Data is user-specific - each user sees only their own data

---

## Development Tips

### Enable Dev Bypass (skip login during development)

**Backend** (`.env`):
```bash
DEV_AUTH_BYPASS=true
```

**Frontend** (`client/.env`):
```bash
REACT_APP_DEV_BYPASS=true
```

Then restart both servers. You'll be auto-logged in as the test user.

### Disable Dev Bypass (production mode - default)

Set both flags to `false` to test the real authentication flow.

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout (revokes refresh tokens)

### Notes (User-Specific)
- `GET /api/notes/:ticker` - Get notes for a ticker
- `POST /api/notes/:ticker` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Favorites (User-Specific)
- `GET /api/favorites` - Get your favorites
- `POST /api/favorites` - Add to favorites
- `PUT /api/favorites/:id` - Update favorite
- `DELETE /api/favorites/:id` - Remove favorite
- `POST /api/favorites/bulk` - Bulk add favorites

### Watchlist (User-Specific)
- `GET /api/watchlist` - Get your watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Stocks (Public Data)
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:ticker` - Get single stock
- `GET /api/stocks/sectors` - Get sector performance
- `GET /api/stocks/deep-pullbacks` - Get pullback opportunities
