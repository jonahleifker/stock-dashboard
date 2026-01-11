/**
 * Sequelize CLI configuration for different environments.
 * Dev/Test use SQLite with storage from SQLITE_STORAGE, Prod uses DATABASE_URL (Postgres).
 */
module.exports = {
  development: {
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
