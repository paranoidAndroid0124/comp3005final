import type { Config } from 'drizzle-kit';
import { resolve } from 'node:path';
import 'dotenv/config';

export default {
  driver: 'pg',
  out: './src/drizzle',
  schema: [resolve(__dirname, './src/drizzle/schema.ts')],
  dbCredentials: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
} satisfies Config;