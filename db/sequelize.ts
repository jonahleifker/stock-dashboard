import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';

let sequelize: Sequelize;
const databaseUrl = process.env.DATABASE_URL as string | undefined;
if (isProduction && databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.PGSSL === '0' ? false : { require: true, rejectUnauthorized: false },
    },
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_STORAGE || './var/dev.sqlite',
    logging: false,
  });
}

export default sequelize;
