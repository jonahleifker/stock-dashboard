# Stock Dashboard v2 - Codebase Analysis & Improvement Plan

**Date**: January 24, 2026  
**Branch**: v2_  
**Purpose**: Document current architecture and required improvements for production readiness

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Hosting Considerations](#hosting-considerations)
4. [Directory Structure Issues](#directory-structure-issues)
5. [API Integration](#api-integration)
6. [Unfinished Features](#unfinished-features)
7. [Priority Action Items](#priority-action-items)
8. [Supabase Migration Guide](#supabase-migration-guide)
9. [Environment Variables Required](#environment-variables-required)

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Express.js + TypeScript |
| **ORM** | Sequelize |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Authentication** | Passport.js (Local + JWT strategies) |
| **Frontend** | React 19 + React Router v7 |
| **UI Components** | Tailwind CSS + Shadcn/ui |
| **Data Fetching** | TanStack Query + Axios |
| **Stock Data** | Yahoo Finance (`yahoo-finance2`) |
| **File Storage** | Supabase Storage |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│  React 19 + React Router v7 + TanStack Query + Shadcn/ui        │
│  /client/src/                                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (Axios → /api/*)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER                             │
│  app.ts → Middleware → Routes → Controllers → Services          │
├─────────────────────────────────────────────────────────────────┤
│  Routes:           │  Services:            │  External APIs:     │
│  /api/stocks       │  stockService.ts      │  Yahoo Finance      │
│  /api/watchlist    │  watchlistService.ts  │  Manus AI           │
│  /api/favorites    │  favoriteService.ts   │  Supabase Storage   │
│  /api/notes        │  noteService.ts       │                     │
│  /api/research     │  manusService.ts      │                     │
│  /api/files        │  fileService.ts       │                     │
│  /api/auth         │                       │                     │
└────────────────────┼───────────────────────┼────────────────────┘
                     │                       │
                     ▼                       ▼
┌─────────────────────────────┐  ┌────────────────────────────────┐
│      REPOSITORIES           │  │       SUPABASE                  │
│  Sequelize models           │  │  File storage only              │
│  StockRepository            │  │  (file bytes, not metadata)     │
│  FavoriteRepository         │  │                                 │
│  WatchlistRepository        │  │                                 │
└─────────────┬───────────────┘  └────────────────────────────────┘
              │
              ▼
┌─────────────────────────────┐
│         DATABASE            │
│  SQLite (dev)               │
│  PostgreSQL (prod)          │
│                             │
│  Tables:                    │
│  - users, roles, permissions│
│  - stocks, notes, articles  │
│  - favorites, watchlist     │
│  - research_files, earnings │
└─────────────────────────────┘
```

### Authentication System

Dual authentication:
- **Session-based** (`/auth/*`) - Traditional web login using Passport Local
- **JWT-based** (`/api/auth/*`) - API calls with 15min access + 7-day refresh tokens

---

## Database Setup

### Configuration
- **Development**: SQLite at `./var/dev.sqlite`
- **Production**: PostgreSQL via `DATABASE_URL` environment variable
- **ORM**: Sequelize (NOT Prisma - there's unused Prisma config)

### Key Configuration Files
- `db/sequelize.ts` - Sequelize instance initialization
- `db/config.cjs` - Sequelize CLI config
- `db/init.ts` - Database initialization
- `models/index.ts` - All model definitions

### Tables
| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `roles` / `permissions` | RBAC system |
| `stocks` | Cached stock data |
| `notes` | User research notes (bull/bear/buy-in) |
| `articles` | Saved article links |
| `research_files` | File metadata (bytes in Supabase) |
| `favorites` | User favorites with price/shares |
| `watchlist` | User watchlist items |
| `earnings_reports` | Earnings data |
| `refresh_tokens` | JWT refresh tokens |

---

## Hosting Considerations

### Current Setup: NOT compatible with Netlify serverless

**Why it won't work:**
1. SQLite requires writable filesystem
2. Sequelize connection pool doesn't work with serverless cold starts
3. Session storage needs persistent connections
4. Database initialization runs at startup, not per-request

### Required Changes for Serverless

1. Use PostgreSQL exclusively (set `DATABASE_URL`)
2. Use connection pooler (PgBouncer) or serverless-friendly client
3. Switch to JWT-only auth (remove session storage)
4. Lazy-load database connections per request

### Recommended Setup: Supabase + Compatible Host

**Database & Storage**: Supabase (PostgreSQL + File Storage)
- See [Supabase Migration Guide](#supabase-migration-guide) for setup instructions

**Recommended Hosting Platforms**:
- ✅ Railway, Render, Fly.io (best for Express apps with persistent connections)
- ✅ Vercel (works with Supabase connection pooler)
- ✅ Traditional VPS (Heroku, DigitalOcean, AWS EC2)
- ❌ Netlify Functions (serverless - requires significant refactoring)

---

## Directory Structure Issues

### Problem: Two `src` Directories

| Directory | Framework | Status |
|-----------|-----------|--------|
| `/src/` (root) | Next.js + Prisma | **UNUSED** - leftover from migration attempt |
| `/client/src/` | React CRA | **ACTIVE** - the real frontend |

### Evidence Root `/src/` is Unused
- Next.js not installed in `package.json`
- Build scripts only reference `client/`
- Uses Prisma, but app uses Sequelize
- `app.ts` doesn't reference root `/src/` files

### Recommendation
**Delete the root `/src/` directory** unless planning to migrate to Next.js.

Also consider deleting these unused files:
- `prisma/` directory (unused Prisma schema)
- `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`
- `prisma.config.ts`

---

## API Integration

### Yahoo Finance Integration

**Package**: `yahoo-finance2` (v3.11.2)

### Current Implementation (Inefficient)
```
getStocks() → loops through tickers in batches of 10
  → getStock() for each ticker individually
    → fetchYahooQuote(singleTicker)
    → quoteSummary(singleTicker)
    → 5 separate historical() calls per ticker
```

**Problem**: For 100 tickers, this makes 600+ API calls instead of ~10-20 batch calls.

### Available But Unused Batch Capability
There's a `src/lib/yahoo.ts` with `fetchStockQuotes(symbols[])` that supports batch requests, but it's in the unused `/src/` directory.

### Recommended Improvements
1. Use `yahooFinance.quote(symbols[])` for batch quotes
2. Fetch 1-year historical data once and calculate shorter periods
3. Add proper rate limiting with exponential backoff
4. Move batch function to active codebase

---

## Unfinished Features

### Critical Issues (Must Fix)

| Issue | Location | Problem |
|-------|----------|---------|
| **Hardcoded user account** | `db/seeders/`, `app.ts` | Only "jonah" user exists, hardcoded throughout. Cannot create new accounts dynamically. |
| **Auth bypass in dev** | `app.ts:62-73` | All requests auto-authenticated with hardcoded user ID 1 |
| **No user registration flow** | `routes/auth.*.ts` | Registration may exist but is not properly wired up for new users |
| **Mock research data** | `CompanyDashboard.tsx:41-54` | Hardcoded placeholder text |
| **In-memory storage** | `manusService.ts:85-87` | Research data stored in Map, not DB |
| **Users route stub** | `routes/users.js` | Just returns "respond with a resource" |

### Missing Features

- **User account creation** - Currently only "jonah" account exists from seeder; no way to create new users
- **Dynamic user management** - Hardcoded user references throughout the codebase need to be replaced
- File upload UI (comment: "News upload coming soon!")
- User profile management endpoints
- Password reset flow
- Email verification
- React error boundary (global error handling)
- API documentation (OpenAPI/Swagger)
- Test coverage (zero test files)

### User Account Issue (Critical)

The application currently has a **hardcoded user problem**:

1. **Seeder creates "jonah"**: The database seeder (`db/seeders/20231010121000-seed-rbac.js`) creates a single user
2. **Auth bypass uses user ID 1**: Development mode (`app.ts`) auto-authenticates all requests as user ID 1
3. **No working registration**: While a Register page exists (`client/src/pages/Register.tsx`), the full flow may not work properly
4. **User-specific data tied to hardcoded IDs**: Favorites, watchlists, notes may be tied to the seeded user

**Required fixes:**
- Ensure `/api/auth/register` endpoint creates users properly
- Remove any hardcoded user ID references
- Test full registration → login → use app flow with a brand new user
- Ensure all user data (favorites, watchlist, notes) is properly scoped to authenticated user

### Code Quality Issues

- 50+ console.log/error statements (should use proper logging)
- Hardcoded values throughout
- No rate limiting on API endpoints
- 401 redirect in API client commented out
- Many error handlers only `console.error` without user notification

---

## Priority Action Items

### Phase 1: Critical Security & Stability

- [ ] **Remove hardcoded "jonah" user** - App should not depend on a specific seeded user
- [ ] **Implement working user registration** - Users must be able to create new accounts
- [ ] **Fix user authentication flow** - Login should work with any registered user, not just hardcoded ones
- [ ] **Fix frontend auth bypass** - Remove hardcoded user in `client/src/context/AuthContext.tsx`
- [ ] Remove or properly gate authentication bypass in `app.ts` (backend)
- [ ] **Set up Supabase PostgreSQL** - Follow [Supabase Migration Guide](#supabase-migration-guide) above
- [ ] Replace in-memory storage in `manusService.ts` with database
- [ ] Add React error boundary
- [ ] Fix 401 redirect handling in API client

### Phase 2: Cleanup & Performance

- [ ] Delete unused `/src/` directory (Next.js/Prisma leftovers)
- [ ] Delete unused config files (`prisma/`, `next.config.ts`, etc.)
- [ ] Implement batch ticker fetching in `stockService.ts`
- [ ] Add proper rate limiting
- [ ] Replace console.log with proper logging (Winston/Pino)

### Phase 3: Feature Completion

- [ ] Complete users route with CRUD operations
- [ ] Implement password reset flow
- [ ] Add file upload UI
- [ ] Replace mock research data with real API integration
- [ ] Add loading states and user error notifications

### Phase 4: Production Readiness

- [ ] Add test coverage (unit + integration)
- [ ] Create API documentation
- [ ] Set up proper environment variable documentation
- [ ] Add deployment guide
- [ ] Configure proper CORS for production

---

## Supabase Migration Guide

### Why Supabase for Both Database + Storage?

- **Single service** - One dashboard, one bill, simpler configuration
- **Free tier** - 500MB database + 1GB file storage
- **PostgreSQL** - Production-ready, same as current prod target
- **Already using it** - File storage is already on Supabase
- **Built-in auth** - Option to use Supabase Auth later if needed

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project (or use existing)
2. Note your project reference (the `[project-ref]` in URLs)
3. Go to **Project Settings → Database** to get connection strings
4. Go to **Project Settings → API** to get your keys

### Step 2: Get Your Connection Strings

From the Supabase dashboard, you'll need:

| Setting | Where to Find | Used For |
|---------|---------------|----------|
| **Database URL** | Settings → Database → Connection string → URI | Sequelize connection |
| **Project URL** | Settings → API → Project URL | File storage API |
| **Anon Key** | Settings → API → anon/public key | File storage auth |
| **Service Role Key** | Settings → API → service_role key | Server-side operations (optional) |

### Step 3: Configure Connection Pooling (Recommended)

For production, use Supabase's connection pooler to handle serverless/high-traffic scenarios:

1. In Supabase Dashboard → Settings → Database
2. Find "Connection Pooling" section
3. Use the **Transaction** mode connection string for Sequelize

**Direct connection** (for migrations):
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Pooled connection** (for app - recommended):
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 4: Update Environment Variables

Create/update your `.env` file:

```env
# ===========================================
# SUPABASE CONFIGURATION (Database + Storage)
# ===========================================

# Database - Use pooled connection for the app
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection - For running migrations only
DIRECT_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# File Storage
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key  # Optional, for server-side file ops

# ===========================================
# AUTHENTICATION
# ===========================================

JWT_SECRET=generate-a-strong-random-string-here
SESSION_SECRET=generate-another-strong-random-string-here

# ===========================================
# AI RESEARCH (Optional)
# ===========================================

OPENAI_API_KEY=sk-your-openai-key  # For Manus AI research features

# ===========================================
# SERVER
# ===========================================

PORT=6405
NODE_ENV=development  # Change to 'production' for prod
```

### Step 5: Update Database Config

The `db/sequelize.ts` file should already support `DATABASE_URL`. Verify it uses:

```typescript
// Should check for DATABASE_URL in production
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && process.env.DATABASE_URL) {
  // Use PostgreSQL via DATABASE_URL
} else {
  // Fall back to SQLite for local dev
}
```

### Step 6: Run Migrations on Supabase

```bash
# Set the direct URL for migrations (bypasses pooler)
export DATABASE_URL=$DIRECT_DATABASE_URL

# Run migrations
npm run db:migrate

# Seed initial data (roles, permissions)
npm run db:seed
```

### Step 7: Create Storage Bucket

In Supabase Dashboard:

1. Go to **Storage** section
2. Create a bucket called `research-files` (or whatever your app uses)
3. Set bucket policies:
   - For authenticated uploads: Enable RLS
   - For public reads: Create a policy allowing public SELECT

### Step 8: Verify Configuration

Test your setup:

```bash
# Test database connection
npm run dev

# In another terminal, test the API
curl http://localhost:6405/api/stocks
```

### File Changes Required

| File | Change Needed |
|------|---------------|
| `db/sequelize.ts` | Ensure it reads `DATABASE_URL` for PostgreSQL |
| `db/config.cjs` | Update for Sequelize CLI to use `DATABASE_URL` |
| `config/supabase.ts` | Already configured, verify bucket name |
| `.env` | Add all variables from Step 4 |

### Local Development Options

**Option A: Use SQLite locally (current setup)**
- Keep using SQLite for local dev
- Only use Supabase PostgreSQL in production
- Simpler, no internet required

**Option B: Use Supabase for local dev too**
- More realistic testing
- Requires internet connection
- Set `NODE_ENV=production` locally to force PostgreSQL

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Use pooled connection string, not direct |
| "prepared statement already exists" | Add `?pgbouncer=true` to connection string |
| Migration fails | Use `DIRECT_DATABASE_URL` for migrations |
| File upload fails | Check bucket exists and policies are set |
| SSL errors | Supabase requires SSL; Sequelize should handle this automatically |

---

## Environment Variables Required

```env
# ===========================================
# SUPABASE (Database + File Storage)
# ===========================================

# App database connection (use pooled for production)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection for migrations
DIRECT_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# File storage
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# ===========================================
# AUTHENTICATION
# ===========================================

JWT_SECRET=your-jwt-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars

# ===========================================
# OPTIONAL
# ===========================================

# AI Research
OPENAI_API_KEY=sk-your-openai-key

# Local development override
SQLITE_STORAGE=./var/dev.sqlite

# ===========================================
# SERVER
# ===========================================

PORT=6405
NODE_ENV=development
```

### Generating Secrets

For `JWT_SECRET` and `SESSION_SECRET`, generate strong random strings:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Quick Commands

```bash
# Development
npm run dev              # Run server + client

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed initial data
npm run db:reset         # Reset & reseed

# Build
npm run build:all        # Build both backend and frontend
```

---

## Files Reference

| Category | Key Files |
|----------|-----------|
| Entry Point | `bin/www.ts`, `app.ts` |
| Routes | `routes/*.ts` |
| Controllers | `controllers/*.ts` |
| Services | `services/*.ts` |
| Repositories | `repositories/*.ts` |
| Models | `models/index.ts` |
| Database | `db/sequelize.ts`, `db/migrations/` |
| Frontend | `client/src/` |
| Auth | `auth/`, `middleware/auth.ts` |
| Config | `config/`, `.env` |
