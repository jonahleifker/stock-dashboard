# Stock Dashboard V2 - Full Migration Plan

## Overview

Migrate the existing Python/Flask stock dashboard to a modern Express + TypeScript + React + shadcn/ui stack using the appstarter framework. Add SQLite caching, user authentication, collaborative notes with bull/bear/buy-in structure, file uploads to Supabase Storage, and Manus AI research integration.

## Current State

- **Backend**: Python Flask server with 4 API endpoints (stocks, sectors, deep-pullbacks, ipos)
- **Data Source**: Yahoo Finance via yfinance (Python)
- **Frontend**: Standalone HTML files with CDN-loaded React + Tailwind
- **Database**: None (stateless)
- **Auth**: None

## Desired End State

- **Backend**: Express + TypeScript with MVC architecture
- **Data Source**: Yahoo Finance via yahoo-finance2 (Node.js)
- **Frontend**: React + TypeScript + shadcn/ui with proper build system
- **Database**: SQLite for stocks, users, notes, articles; Supabase Storage for files
- **Auth**: Simple username/password login
- **Features**: Stock tracking, collaborative notes (bull/bear/buy-in), file uploads, Manus AI placeholder

## What We're NOT Doing

- Complex role-based permissions (just simple user identification)
- Real-time WebSocket updates
- Mobile app
- Deployment/hosting setup
- Actual Manus AI implementation (just the framework/interface)

## Branch Strategy

All work will be done on branch: `2026-v1`

---

## Phase 1: Project Scaffold & Git Setup

### Overview
Create the new branch and scaffold the project using the appstarter framework.

### Steps

1. **Create and checkout new branch**
   - Branch name: `2026-v1`
   - Base: current main/master branch

2. **Backup existing files**
   - Move `server.py` to `legacy/server.py`
   - Move HTML dashboards to `legacy/`
   - Keep `docs/` folder in place

3. **Run appstarter scaffold**
   - Execute: `curl -fsSL https://raw.githubusercontent.com/pradeeps-repo/appstarter/main/setup.sh | bash -s stock-dashboard-v2`
   - This creates Express + React + shadcn/ui structure

4. **Merge scaffolded project into repo**
   - Move generated files from `stock-dashboard-v2/` into root
   - Preserve `docs/` and `legacy/` folders
   - Update `.gitignore` as needed

### Success Criteria
- [ ] Branch `2026-v1` exists and is checked out
- [ ] Appstarter scaffold completed successfully
- [ ] Project structure has `server/` (Express) and `client/` (React) directories
- [ ] `npm install` works in both directories
- [ ] `npm run dev` starts both servers concurrently

---

## Phase 2: Database Layer (SQLite)

### Overview
Set up SQLite database with tables for stocks, users, notes, and articles.

### Database Schema

#### Table: `users`
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE NOT NULL)
- password_hash (TEXT NOT NULL)
- display_name (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

#### Table: `stocks`
- ticker (TEXT PRIMARY KEY)
- company_name (TEXT)
- sector (TEXT)
- current_price (REAL)
- high_30d, high_3mo, high_6mo, high_1yr (REAL)
- change_7d, change_30d, change_90d (REAL)
- market_cap (INTEGER)
- last_updated (DATETIME)

#### Table: `notes`
- id (INTEGER PRIMARY KEY)
- ticker (TEXT FK -> stocks)
- user_id (INTEGER FK -> users)
- bull_case (TEXT) - Why to buy
- bear_case (TEXT) - Risks/concerns
- buy_in_price (REAL) - Target entry price
- current_stance (TEXT) - 'bullish', 'bearish', 'neutral'
- created_at (DATETIME)
- updated_at (DATETIME)

#### Table: `articles`
- id (INTEGER PRIMARY KEY)
- ticker (TEXT FK -> stocks)
- user_id (INTEGER FK -> users)
- title (TEXT)
- url (TEXT)
- source_name (TEXT)
- published_at (DATETIME)
- added_at (DATETIME)

#### Table: `research_files`
- id (INTEGER PRIMARY KEY)
- ticker (TEXT FK -> stocks)
- user_id (INTEGER FK -> users)
- filename (TEXT)
- file_type (TEXT) - pdf, csv, docx, txt, etc.
- supabase_path (TEXT) - Path in Supabase Storage
- file_size (INTEGER)
- source (TEXT) - 'manual' or 'manus'
- uploaded_at (DATETIME)

### Steps

1. **Install SQLite dependencies**
   - Add `better-sqlite3` and `@types/better-sqlite3` to server

2. **Create database initialization module**
   - File: `server/src/database/init.ts`
   - Creates tables if not exist
   - Runs on server startup

3. **Create model files**
   - `server/src/models/User.ts`
   - `server/src/models/Stock.ts`
   - `server/src/models/Note.ts`
   - `server/src/models/Article.ts`
   - `server/src/models/ResearchFile.ts`

4. **Create repository layer**
   - CRUD operations for each model
   - Upsert logic for stocks (update if exists, create if new)

### Success Criteria
- [ ] SQLite database file created at `server/data/stocks.db`
- [ ] All tables created with correct schema
- [ ] Repository methods work for CRUD operations
- [ ] Upsert correctly updates existing stock tickers

---

## Phase 3: Stock Data Service Migration

### Overview
Migrate Yahoo Finance data fetching from Python yfinance to Node.js yahoo-finance2.

### API Endpoints to Implement

1. **GET /api/stocks**
   - Returns Fortune 100 stocks with current price, 30-day high, sector
   - Checks cache first (SQLite), fetches fresh if stale (>1 hour)
   - Upserts results to SQLite

2. **GET /api/sectors**
   - Returns sector performance analysis
   - Groups 200+ stocks by sector
   - Calculates 7d, 30d, 90d averages

3. **GET /api/deep-pullbacks**
   - Returns stocks down 50%+ from highs
   - Analyzes 3mo, 6mo, 1yr timeframes

4. **GET /api/ipos**
   - Returns recent IPO performance
   - Compares current price to IPO price

5. **POST /api/stocks/refresh**
   - Force refresh all stock data from Yahoo Finance
   - Bypasses cache

### Steps

1. **Install yahoo-finance2**
   - Add `yahoo-finance2` to server dependencies

2. **Create stock service**
   - File: `server/src/services/stockService.ts`
   - Batch fetch using `yahooFinance.quote()` for multiple tickers
   - Historical data using `yahooFinance.historical()`

3. **Create stock controller**
   - File: `server/src/controllers/stockController.ts`
   - Implements all 5 endpoints above

4. **Create stock routes**
   - File: `server/src/routes/stockRoutes.ts`
   - Wire up endpoints to controller

5. **Implement caching logic**
   - Check SQLite `last_updated` timestamp
   - If > 1 hour old, fetch fresh data
   - Upsert new data to SQLite

6. **Migrate ticker lists**
   - Copy TICKERS, EXPANDED_TICKERS, RECENT_IPOS from legacy server.py
   - Store in `server/src/config/tickers.ts`

### Success Criteria
- [ ] All 5 endpoints return correct data
- [ ] Data is cached in SQLite
- [ ] Subsequent requests use cache (fast response)
- [ ] Force refresh endpoint works
- [ ] Response format matches legacy API

---

## Phase 4: User Authentication

### Overview
Implement simple username/password authentication with JWT tokens.

### API Endpoints

1. **POST /api/auth/register**
   - Creates new user account
   - Hashes password with bcrypt
   - Returns JWT token

2. **POST /api/auth/login**
   - Validates credentials
   - Returns JWT token

3. **GET /api/auth/me**
   - Returns current user info
   - Requires valid JWT

4. **POST /api/auth/logout**
   - Invalidates token (client-side handling)

### Steps

1. **Install auth dependencies**
   - Add `bcryptjs`, `jsonwebtoken`, and types

2. **Create auth service**
   - File: `server/src/services/authService.ts`
   - Password hashing/verification
   - JWT token generation/validation

3. **Create auth middleware**
   - File: `server/src/middleware/authMiddleware.ts`
   - Validates JWT on protected routes
   - Attaches user to request object

4. **Create auth controller and routes**
   - File: `server/src/controllers/authController.ts`
   - File: `server/src/routes/authRoutes.ts`

5. **Add JWT secret to environment**
   - Add `JWT_SECRET` to `.env`

### Success Criteria
- [ ] User can register with username/password
- [ ] User can login and receive JWT
- [ ] Protected routes reject invalid tokens
- [ ] User info attached to authenticated requests

---

## Phase 5: Notes System

### Overview
Implement collaborative notes with bull case, bear case, and buy-in price structure.

### API Endpoints

1. **GET /api/notes/:ticker**
   - Returns all notes for a stock
   - Includes user display names
   - Sorted by most recent

2. **POST /api/notes/:ticker**
   - Creates new note for stock
   - Requires authentication
   - Body: { bull_case, bear_case, buy_in_price, current_stance }

3. **PUT /api/notes/:id**
   - Updates existing note
   - Only note owner can edit

4. **DELETE /api/notes/:id**
   - Deletes note
   - Only note owner can delete

5. **GET /api/notes/user/:userId**
   - Returns all notes by a specific user

### Steps

1. **Create notes service**
   - File: `server/src/services/noteService.ts`
   - CRUD operations with user ownership

2. **Create notes controller and routes**
   - File: `server/src/controllers/noteController.ts`
   - File: `server/src/routes/noteRoutes.ts`

3. **Add authorization checks**
   - Verify user owns note before edit/delete

### Success Criteria
- [ ] Users can create notes with bull/bear/buy-in fields
- [ ] All users can view all notes
- [ ] Only note owner can edit/delete their notes
- [ ] Notes display with user attribution

---

## Phase 6: File Upload System (Supabase Storage)

### Overview
Enable file uploads for research documents, stored in Supabase Storage with metadata in SQLite.

### Supported File Types
- PDF (.pdf)
- Word Documents (.docx, .doc)
- Excel/CSV (.xlsx, .xls, .csv)
- Text files (.txt, .md)
- Images (.png, .jpg, .jpeg)

### API Endpoints

1. **POST /api/files/:ticker/upload**
   - Accepts multipart file upload
   - Stores file in Supabase Storage
   - Saves metadata to SQLite
   - Returns file ID and URL

2. **GET /api/files/:ticker**
   - Returns all files for a stock
   - Includes signed URLs for download

3. **GET /api/files/:id/download**
   - Returns signed download URL
   - Redirects or returns URL based on query param

4. **DELETE /api/files/:id**
   - Deletes from Supabase Storage
   - Removes metadata from SQLite
   - Only uploader can delete

### Steps

1. **Set up Supabase project**
   - Create Supabase account/project
   - Create storage bucket: `research-files`
   - Get API credentials

2. **Install Supabase client**
   - Add `@supabase/supabase-js` to server

3. **Add Supabase config**
   - Add `SUPABASE_URL` and `SUPABASE_KEY` to `.env`
   - Create `server/src/config/supabase.ts`

4. **Create file service**
   - File: `server/src/services/fileService.ts`
   - Upload to Supabase Storage
   - Generate signed URLs
   - Handle multiple file types

5. **Create file controller and routes**
   - File: `server/src/controllers/fileController.ts`
   - File: `server/src/routes/fileRoutes.ts`
   - Use multer for multipart handling

6. **Add file type validation**
   - Whitelist allowed MIME types
   - Max file size: 50MB

### Success Criteria
- [ ] Files upload successfully to Supabase Storage
- [ ] Metadata stored in SQLite
- [ ] Files downloadable via signed URLs
- [ ] All supported file types work
- [ ] Only uploader can delete files

---

## Phase 7: Articles/Links System

### Overview
Allow users to save and share article links related to stocks.

### API Endpoints

1. **GET /api/articles/:ticker**
   - Returns all articles for a stock
   - Sorted by published date

2. **POST /api/articles/:ticker**
   - Adds new article link
   - Body: { title, url, source_name, published_at }

3. **DELETE /api/articles/:id**
   - Removes article link
   - Only creator can delete

### Steps

1. **Create articles service**
   - File: `server/src/services/articleService.ts`

2. **Create articles controller and routes**
   - File: `server/src/controllers/articleController.ts`
   - File: `server/src/routes/articleRoutes.ts`

### Success Criteria
- [ ] Users can add article links
- [ ] Articles display with title, source, date
- [ ] Only creator can delete their links

---

## Phase 8: Manus AI Integration (Placeholder)

### Overview
Create the framework for Manus AI research integration. Actual API key will be added later.

### API Endpoints

1. **POST /api/research/:ticker/request**
   - Initiates research request to Manus
   - Stores request status in memory/SQLite
   - Returns request ID

2. **GET /api/research/:ticker/status/:requestId**
   - Returns status of research request
   - Returns results when complete

3. **GET /api/research/:ticker**
   - Returns all completed research for a stock

### Steps

1. **Create Manus service placeholder**
   - File: `server/src/services/manusService.ts`
   - Stub methods that return mock data
   - Easy to swap in real API later

2. **Create Manus config**
   - Add `MANUS_API_KEY` and `MANUS_API_URL` to `.env` (empty for now)
   - Service checks if key exists before making calls

3. **Create research controller and routes**
   - File: `server/src/controllers/researchController.ts`
   - File: `server/src/routes/researchRoutes.ts`

4. **Design request/response interface**
   - Define TypeScript interfaces for Manus API
   - Document expected request/response format

### Success Criteria
- [x] Endpoints exist and return placeholder responses
- [x] Service ready to accept API key via environment variable
- [x] Clear documentation on how to enable real Manus integration

---

## Phase 9: Frontend - Core Layout & Auth

### Overview
Build the React frontend shell with navigation, auth flows, and base styling.

### Pages to Create

1. **Login Page** (`/login`)
   - Username/password form
   - Register link

2. **Register Page** (`/register`)
   - Username/password/confirm form
   - Login link

3. **Dashboard Layout**
   - Top navigation with tabs
   - User menu (logout)
   - Main content area

### Components to Create

1. **AuthProvider** - Context for auth state
2. **ProtectedRoute** - Redirects to login if not authenticated
3. **Navbar** - Top navigation with tabs
4. **UserMenu** - Dropdown with user info and logout

### Steps

1. **Set up shadcn/ui components**
   - Install: Button, Input, Card, Tabs, Table, Badge, Dialog, DropdownMenu, Avatar

2. **Create auth context**
   - File: `client/src/context/AuthContext.tsx`
   - Manages JWT storage, user state

3. **Create auth pages**
   - File: `client/src/pages/Login.tsx`
   - File: `client/src/pages/Register.tsx`

4. **Create layout components**
   - File: `client/src/components/Navbar.tsx`
   - File: `client/src/components/ProtectedRoute.tsx`

5. **Set up routing**
   - Install `react-router-dom`
   - Configure routes in `App.tsx`

6. **Create API client**
   - File: `client/src/lib/api.ts`
   - Axios instance with JWT interceptor

### Success Criteria
- [ ] Login/register pages work
- [ ] JWT stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Navigation shows current user

---

## Phase 10: Frontend - Stock Dashboard Tabs

### Overview
Migrate the 4 dashboard tabs from legacy HTML to React components.

### Tabs to Implement

1. **Pullbacks Tab**
   - Stock table with ticker, company, current price, 30d high, % from high
   - Search filter
   - "Opportunities only" toggle (≥10% down)
   - Refresh button

2. **Deep Pullbacks Tab**
   - Stocks down 50%+ from highs
   - Timeframe selector (3mo, 6mo, 1yr)
   - Market cap display

3. **IPOs Tab**
   - Recent IPO performance
   - IPO date, price, current price, % change
   - Winner/loser badges

4. **Sectors Tab**
   - Sector cards with average performance
   - Expandable to show top stocks
   - Timeframe selector (7d, 30d, 90d)

### Components to Create

1. **StockTable** - Reusable table with sorting
2. **PerformanceBadge** - Color-coded % change badge
3. **SectorCard** - Expandable sector summary
4. **RefreshButton** - Loading state button
5. **TimeframeSelector** - Button group for timeframes

### Steps

1. **Create shared components**
   - Build reusable table, badges, selectors

2. **Create tab pages**
   - File: `client/src/pages/Pullbacks.tsx`
   - File: `client/src/pages/DeepPullbacks.tsx`
   - File: `client/src/pages/IPOs.tsx`
   - File: `client/src/pages/Sectors.tsx`

3. **Connect to API**
   - Fetch data from Express endpoints
   - Handle loading/error states

4. **Add to navigation**
   - Wire up tabs in Navbar

### Success Criteria
- [ ] All 4 tabs display correct data
- [ ] Search and filters work
- [ ] Refresh fetches fresh data
- [ ] UI matches or improves on legacy design

---

## Phase 11: Frontend - Stock Detail Page

### Overview
Create individual stock pages with notes, files, articles, and research.

### Page Sections

1. **Stock Header**
   - Ticker, company name, sector
   - Current price, % changes
   - Quick stats

2. **Notes Section**
   - List of all user notes
   - Each note shows: user, bull case, bear case, buy-in price, stance
   - Add/Edit note form

3. **Files Section**
   - List of uploaded research files
   - Upload button with file picker
   - Download links

4. **Articles Section**
   - List of saved article links
   - Add article form

5. **Research Section**
   - Manus AI trigger button (placeholder)
   - Previous research results

### Components to Create

1. **StockHeader** - Price and stats display
2. **NoteCard** - Individual note display
3. **NoteForm** - Create/edit note with bull/bear/buy-in fields
4. **FileList** - Uploaded files with download
5. **FileUpload** - File picker and upload
6. **ArticleList** - Saved articles
7. **ArticleForm** - Add new article
8. **ResearchPanel** - Manus AI interface

### Steps

1. **Create stock detail page**
   - File: `client/src/pages/StockDetail.tsx`
   - Route: `/stocks/:ticker`

2. **Create note components**
   - NoteCard, NoteForm with proper fields

3. **Create file components**
   - FileList, FileUpload with drag-drop

4. **Create article components**
   - ArticleList, ArticleForm

5. **Create research panel**
   - Placeholder UI for Manus integration

6. **Link from dashboard tables**
   - Make ticker cells clickable

### Success Criteria
- [ ] Stock detail page shows all sections
- [ ] Notes CRUD works with bull/bear/buy-in
- [ ] File upload works for all supported types
- [ ] Articles can be added and viewed
- [ ] Research panel displays placeholder

---

## Phase 12: Testing & Polish

### Overview
Final testing, bug fixes, and UI polish.

### Testing Checklist

#### Backend API Tests
- [ ] All stock endpoints return correct data
- [ ] Auth endpoints work (register, login, me)
- [ ] Notes CRUD with proper authorization
- [ ] File upload/download works
- [ ] Articles CRUD works
- [ ] Research placeholder returns mock data

#### Frontend Tests
- [ ] Login/register flow complete
- [ ] All 4 dashboard tabs load data
- [ ] Stock detail page displays all sections
- [ ] Forms validate input
- [ ] Error states display properly
- [ ] Loading states show spinners

#### Integration Tests
- [ ] End-to-end: Register → Login → View Stocks → Add Note → Upload File
- [ ] Data persists across page refreshes
- [ ] Multiple users see shared notes

### Polish Tasks

1. **UI Consistency**
   - Ensure shadcn components used throughout
   - Consistent spacing and typography
   - Responsive design for smaller screens

2. **Error Handling**
   - Toast notifications for errors
   - Form validation messages
   - API error display

3. **Performance**
   - Add loading skeletons
   - Optimize re-renders
   - Cache API responses where appropriate

### Success Criteria
- [ ] All tests pass
- [ ] No console errors
- [ ] UI looks polished and consistent
- [ ] App works end-to-end

---

## Environment Variables Summary

### Server (.env)
```
PORT=3001
JWT_SECRET=<random-string>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
MANUS_API_KEY=<leave-empty-for-now>
MANUS_API_URL=<leave-empty-for-now>
```

### Client (.env)
```
VITE_API_URL=http://localhost:3001/api
```

---

## File Structure (Final)

```
stock-dashboard/
├── docs/
│   └── plans/
│       └── 001_dashboard_v2_full_migration.md
├── legacy/
│   ├── server.py
│   ├── trading-dashboard-final.html
│   └── stock-dashboard-with-tabs.html
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── tickers.ts
│   │   │   └── supabase.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── stockController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── fileController.ts
│   │   │   ├── articleController.ts
│   │   │   └── researchController.ts
│   │   ├── database/
│   │   │   └── init.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Stock.ts
│   │   │   ├── Note.ts
│   │   │   ├── Article.ts
│   │   │   └── ResearchFile.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── stockRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   ├── fileRoutes.ts
│   │   │   ├── articleRoutes.ts
│   │   │   └── researchRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── stockService.ts
│   │   │   ├── noteService.ts
│   │   │   ├── fileService.ts
│   │   │   ├── articleService.ts
│   │   │   └── manusService.ts
│   │   └── index.ts
│   ├── data/
│   │   └── stocks.db
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn)
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── StockTable.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NoteForm.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleForm.tsx
│   │   │   └── ResearchPanel.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Pullbacks.tsx
│   │   │   ├── DeepPullbacks.tsx
│   │   │   ├── IPOs.tsx
│   │   │   ├── Sectors.tsx
│   │   │   └── StockDetail.tsx
│   │   └── App.tsx
│   └── package.json
└── package.json (root - concurrent scripts)
```

---

## Execution Order

An AI agent should execute phases in order (1-12). Each phase should be completed and verified before moving to the next.

**Critical Dependencies:**
- Phase 2 (Database) must complete before Phases 3-8
- Phase 4 (Auth) must complete before any authenticated features
- Phase 9 (Frontend Core) must complete before Phases 10-11
- Phase 6 (Supabase) requires Supabase project setup (manual step)

**Manual Steps Required:**
1. Create Supabase project and get credentials (before Phase 6)
2. Obtain Manus API key when available (after Phase 8)
