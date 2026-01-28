/**
 * Sequelize CLI configuration for different environments.
 * If DATABASE_URL is set, use PostgreSQL (e.g., Supabase).
 * Otherwise, fallback to SQLite for local/offline development.
 */
require('dotenv').config();

module.exports = {
  development: process.env.DATABASE_URL ? {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.PGSSL === '0' ? false : { require: true, rejectUnauthorized: false },
    },
  } : {
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './var/dev.sqlite',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || ':memory:',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.PGSSL === '0' ? false : { require: true, rejectUnauthorized: false },
    },
  },
};
