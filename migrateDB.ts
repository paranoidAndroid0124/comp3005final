import "dotenv/config";
import postgres from "postgres";
import {drizzle} from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });
const queryConnection = postgres(process.env.DATABASE_URL!);

const db = drizzle(queryConnection);

async function setUpDB(): Promise<void> {
    await migrate(drizzle(migrationConnection), {
        migrationsFolder: "src/drizzle",
    });
    await migrationConnection.end();
}

setUpDB();