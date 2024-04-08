import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import Fastify from "fastify";
import cors from '@fastify/cors'

import { membersRoutes } from "./routes/membersRoutes";
import { usersRoutes} from "./routes/usersRoutes";
import { timeSlotRoutes} from "./routes/timeSlotRoutes";
import { equipmentRoutes } from "./routes/equipmentRoutes";
import { billingRoute } from "./routes/billingRoute";
import {members, roles, timeSlots} from "./src/drizzle/schema";
import { users } from "./src/drizzle/schema";
import {eq} from "drizzle-orm";

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });
const queryConnection = postgres(process.env.DATABASE_URL!);

const db = drizzle(queryConnection);


const main = async () => {
  // *** Set up db *** //
  // await setUpDB();

  // *** insert data *** //
  await insertInitialData();

  // *** Set up and start Fastify server *** //
  const fastify = Fastify({ logger: true });

  fastify.register(cors);

  // Declare a route
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  await membersRoutes(fastify);
  await usersRoutes(fastify);
  await timeSlotRoutes(fastify);
  // fastify.register(equipmentRoutes);
  // fastify.register(billingRoute);

  console.log("Starting server");
  // Run the server!
  try {
    await fastify.listen({ port: 3001 });
    const address = fastify.server.address();
    const port = typeof address === "string" ? address : address?.port;

    console.log(`server listening on ${port}`);
    fastify.log.info(`server listening on ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

async function setUpDB(): Promise<void> {
  await migrate(drizzle(migrationConnection), {
    migrationsFolder: "src/drizzle",
  });
  await migrationConnection.end();
}

async function insertInitialData(): Promise<void> {
  const rolesToAdd = ['admin', 'member', 'trainer'];
  for (const role of rolesToAdd) {
    // SELECT 1 FROM roles WHERE role_name = '${role}'
    const roleExists = await db.select().from(roles).where(eq(roles.role_name, role))
    if (!roleExists.length) {
      await db.insert(roles).values({role_name: role}).execute();
    }
  }
}

main().catch((err) => console.error(err));
