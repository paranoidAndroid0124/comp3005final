import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const queryConnection = postgres(process.env.DATABASE_URL!);

// Export the drizzle instance
export const db = drizzle(queryConnection);