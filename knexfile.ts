import type { Knex } from 'knex';
import 'dotenv/config';

const config: Knex.Config = {
  client: 'pg',

  connection: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },

  migrations: {
    directory: './src/app/database/migrations',
    extension: 'ts',
  },

  seeds: {
    directory: './src/app/database/seeds',
    extension: 'ts',
  },
};

export default config;