# Migration Guide: SQLite to Supabase PostgreSQL

## Overview
Your app already supports both SQLite (dev) and PostgreSQL (production). This guide shows how to migrate to Supabase PostgreSQL if desired.

## Current State
- ✅ SQLite for local development
- ✅ Supabase Storage for files
- ✅ Code supports PostgreSQL (via DATABASE_URL)

## Why Migrate to Supabase PostgreSQL?

### Pros
- Production-ready database with backups
- Better performance for multiple users
- Centralized services (database + storage in one place)
- Free tier includes 500MB database
- Automatic SSL
- Built-in auth (if you want to use it later)

### Cons
- Adds external dependency for local development (unless you keep SQLite for dev)
- Network latency vs local SQLite
- Free tier limits (500MB database, API calls)

## Migration Steps

### Step 1: Get Supabase PostgreSQL Connection String

1. Go to your Supabase project
2. Click **Settings** (gear icon) > **Database**
3. Scroll to **Connection string** > **URI**
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
   ```

### Step 2: Update Environment Variables

Create/update `.env.production` (for production):
```env
NODE_ENV=production
PORT=3001

# Supabase PostgreSQL Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
PGSSL=1

# Supabase Storage (existing)
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_KEY=your-anon-key

# Auth secrets
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

Keep `.env` for local development:
```env
NODE_ENV=development
PORT=3001

# Uses SQLite by default (no DATABASE_URL)
# Supabase Storage (existing)
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_KEY=your-anon-key

# Auth secrets
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Step 3: Run Migrations on Supabase

```bash
# Load production environment
NODE_ENV=production npm run db:migrate
```

This will create all tables in your Supabase PostgreSQL database.

### Step 4: Seed Data (Optional)

```bash
NODE_ENV=production npm run db:seed
```

### Step 5: Test Connection

Create a test script `test-db-connection.ts`:
```typescript
import sequelize from './db/sequelize';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    console.log('📊 Dialect:', sequelize.getDialect());
    console.log('🔌 Database:', sequelize.config.database);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
NODE_ENV=production npx ts-node test-db-connection.ts
```

## Deployment Options

### Option A: Both Environments Use Supabase (Simpler)
Remove the SQLite database entirely, use Supabase for both dev and production.

**Update `db/sequelize.ts`:**
```typescript
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV !== 'production',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;
```

### Option B: Hybrid (Recommended for Development)
Keep SQLite for local dev, use Supabase PostgreSQL for production.

**Keep existing `db/sequelize.ts`** (no changes needed!)

This gives you:
- Fast local development (SQLite)
- Production-ready database (PostgreSQL)
- No internet required for local dev

## Migration Checklist

- [ ] Get Supabase PostgreSQL connection string
- [ ] Update environment variables
- [ ] Run migrations on Supabase: `NODE_ENV=production npm run db:migrate`
- [ ] Test connection
- [ ] Seed initial data if needed
- [ ] Update deployment config to use production env vars
- [ ] Test all API endpoints
- [ ] Verify file uploads still work
- [ ] Check user authentication

## Rollback Plan

If something goes wrong, you can always go back to SQLite:

1. Remove `DATABASE_URL` from environment
2. App will automatically use SQLite
3. Your local SQLite database (`var/dev.sqlite`) still has your data

## Cost Considerations

**Supabase Free Tier:**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

**When to upgrade:**
- Database > 500MB (unlikely for stock dashboard)
- File storage > 1GB
- High traffic (but very generous limits)

## Performance Notes

**SQLite:**
- ✅ Ultra-fast (no network)
- ✅ Perfect for single-user/small teams
- ❌ Not great for concurrent writes

**PostgreSQL:**
- ✅ Production-ready
- ✅ Better for multiple users
- ✅ ACID compliance
- ❌ Network latency

For a stock dashboard with <100 users, both will work great!

## Recommendation

**For your use case, I recommend:**

1. **Development:** Keep SQLite (fast, simple)
2. **Production:** Use Supabase PostgreSQL (free tier is plenty)

Your code already supports this! Just set `DATABASE_URL` in production and you're done.

No need to change anything unless you're deploying to production.
