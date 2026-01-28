import 'dotenv/config';
import { Sequelize } from 'sequelize';

let sequelize: Sequelize;

// Always use DATABASE_URL if provided (even in dev mode for Supabase PostgreSQL)
const databaseUrl = process.env.DATABASE_URL as string | undefined;

console.log('[DB] Database type:', databaseUrl ? 'PostgreSQL' : 'SQLite');

if (databaseUrl) {
  // Connect to PostgreSQL (e.g., Supabase)
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.PGSSL === '0' ? false : { require: true, rejectUnauthorized: false },
    },
  });
} else {
  // Fallback to SQLite for local/offline development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './var/dev.sqlite',
    logging: false,
  });
}

export default sequelize;
