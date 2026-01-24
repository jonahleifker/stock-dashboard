import sequelize from './sequelize';
import models from '../models';

/**
 * Initialize database and sync models
 * This creates tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models (creates tables if they don't exist)
    // Don't use alter mode - use migrations instead for schema changes
    await sequelize.sync({
      alter: false,          // Don't auto-update - use migrations instead
      force: false,          // Never drop tables
    });

    console.log('Database tables synced successfully.');
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  await sequelize.close();
  console.log('Database connection closed.');
}

export default { initializeDatabase, closeDatabase };
