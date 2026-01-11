# Database Architecture - Single SQLite Database Verification

## ✅ Confirmed: Single Database Architecture

The application is correctly configured to use **only one SQLite database** for all data storage.

## Database Configuration

### Location
```
./var/dev.sqlite
```

### Configuration Files

1. **`db/sequelize.ts`** - Main Sequelize instance
   ```typescript
   sequelize = new Sequelize({
     dialect: 'sqlite',
     storage: process.env.SQLITE_STORAGE || './var/dev.sqlite',
     logging: false,
   });
   ```

2. **`db/config.cjs`** - Sequelize CLI configuration
   ```javascript
   development: {
     dialect: 'sqlite',
     storage: process.env.SQLITE_STORAGE || './var/dev.sqlite',
     logging: false,
   }
   ```

3. **Environment Variable** (optional)
   - `SQLITE_STORAGE` - Can override default path
   - Default: `./var/dev.sqlite`

## All Tables in Single Database

The single SQLite database contains **12 tables** total:

### Authentication & Authorization (6 tables)
1. **Users** - User accounts (INTEGER ID)
2. **Roles** - User roles (UUID ID)
3. **Permissions** - System permissions (UUID ID)
4. **UserRoles** - Many-to-many: Users ↔ Roles
5. **RolePermissions** - Many-to-many: Roles ↔ Permissions
6. **RefreshTokens** - JWT refresh tokens

### Stock Dashboard (4 tables)
7. **stocks** - Stock ticker data
8. **notes** - User notes (bull/bear/buy-in)
9. **articles** - Saved article links
10. **research_files** - File metadata (files stored in Supabase)

### System Tables (2 tables)
11. **Sessions** - Express session storage
12. **SequelizeMeta** - Migration tracking

## Data Model Relationships

All foreign keys reference tables within the same database:

```
Users (1) ──→ (N) notes
Users (1) ──→ (N) articles
Users (1) ──→ (N) research_files
Users (1) ──→ (N) RefreshTokens

stocks (1) ──→ (N) notes
stocks (1) ──→ (N) articles
stocks (1) ──→ (N) research_files

Roles (N) ←──→ (N) Users (via UserRoles)
Roles (N) ←──→ (N) Permissions (via RolePermissions)
```

## Verification Commands

### Check database file exists
```bash
ls -lh ./var/dev.sqlite
```

### List all tables
```bash
sqlite3 ./var/dev.sqlite ".tables"
```

### Verify no other database files
```bash
find . -type f \( -name "*.sqlite" -o -name "*.db" -o -name "*.sqlite3" \) | grep -v node_modules
```

Result: Only `./var/dev.sqlite` exists ✅

## Shared Sequelize Instance

All models import from the same Sequelize instance:

```typescript
// models/index.ts
import sequelize from '../db/sequelize';

// All models initialized with same sequelize instance
User.init({ ... }, { sequelize, ... });
Stock.init({ ... }, { sequelize, ... });
Note.init({ ... }, { sequelize, ... });
Article.init({ ... }, { sequelize, ... });
ResearchFile.init({ ... }, { sequelize, ... });
```

## Database Initialization

Single initialization point in `db/init.ts`:

```typescript
import sequelize from './sequelize';

export async function initializeDatabase(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false, force: false });
}
```

This is called once at application startup in `app.ts`.

## Migration Management

All migrations use the same database:

```bash
npx sequelize-cli db:migrate
```

Migrations tracked in `SequelizeMeta` table within the same database.

## Current Status

```
Database: ./var/dev.sqlite (size: ~140KB)

Tables: 12
├── Authentication: 6 tables
├── Stock Dashboard: 4 tables
└── System: 2 tables

Records:
├── Users: 3 (admin + 2 test users)
├── Stocks: 1 (AAPL)
├── Notes: 0 (tested, then deleted)
├── Articles: 0
└── Research Files: 0
```

## Production Configuration

For production, the same architecture applies but uses PostgreSQL:

```javascript
// db/sequelize.ts
if (isProduction && databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    // ... single PostgreSQL database
  });
}
```

## Benefits of Single Database

1. **Simplicity** - One connection pool, one transaction context
2. **ACID Guarantees** - Cross-table transactions work seamlessly
3. **Foreign Keys** - Referential integrity enforced at database level
4. **Backup** - Single file to backup/restore
5. **Development** - Easy to reset, seed, and manage
6. **Performance** - No cross-database query overhead

## No Separate Databases For

- ❌ Auth data is NOT in a separate database
- ❌ Stock data is NOT in a separate database  
- ❌ Notes are NOT in a separate database
- ❌ Session data is NOT in a separate database

✅ **Everything is in `./var/dev.sqlite`**

## Supabase Storage Note

File uploads (Phase 6) will use Supabase Storage for the actual file bytes, but **metadata** (filename, size, user, etc.) will still be stored in the single SQLite database in the `research_files` table.

## Summary

✅ **Confirmed**: The application uses a single SQLite database (`./var/dev.sqlite`) for all data storage.  
✅ All 12 tables exist in this one database.  
✅ All models share the same Sequelize instance.  
✅ All foreign keys reference tables within the same database.  
✅ No separate/multiple database files exist.

**Architecture is correct and follows best practices for a single-database application.**
