import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL;

// The centralized config loader (`src/config.ts`) will have already thrown an
// error if DATABASE_URL is not set, so we can safely use the `!` operator here
// after checking for its presence.
if (!dbUrl) {
  // This should not be reached if the config is loaded correctly
  throw new Error('DATABASE_URL is not defined. Please check server configuration.');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    // The host is derived from the connection string, so this is not needed
    // host: undefined, 
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;