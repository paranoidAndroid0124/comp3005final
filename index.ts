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
import {adminStaff, members, roles, timeSlots, trainer, userRoles} from "./src/drizzle/schema";
import { users } from "./src/drizzle/schema";
import {eq} from "drizzle-orm";
import {trainerRoute} from "./routes/trainerRoute";
import bcrypt from "bcrypt";

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
  await trainerRoute(fastify);
  await equipmentRoutes(fastify);
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

  const hashedPassword = await bcrypt.hash('password', 10);
  const trainersToAdd = [
    {first_name: 'John', last_name: 'Doe', email: 'john@doe.com', password: hashedPassword, phone: '1234567890', address: 'doe street'},
    {first_name: 'Jane', last_name: 'Smith', email: 'jane@smith.com', password: hashedPassword, phone: '1234567890', address: 'jane street'},
    {first_name: 'Jim', last_name: 'Bean', email: 'jim@bean.com', password: hashedPassword, phone: '1234567890', address: 'bean street'},
  ]
  for (const user of trainersToAdd) {
    // Check if user already exists based on their email
    const userExists = await db.select().from(users).where(eq(users.email, user.email)).execute();
    if (!userExists.length) {
      const newUser = await db.insert(users).values({
        email: user.email,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone,
        address: user.address,
      }).returning({insertedID: users.user_id}).execute();

      await db.insert(userRoles).values({user_id: newUser[0].insertedID, role_id: 3 });
      await db.insert(trainer).values({user_id: newUser[0].insertedID});
    }
  }
  // add admin
  const adminToAdd = [
    {first_name: 'admin', last_name: 'admin', email: 'admin@admin.com', password: hashedPassword, phone: '1234567890', address: 'admin street'},
  ]
  const admin = adminToAdd[0];
  const adminExist = await db.select().from(users).where(eq(users.email, admin.email)).execute();

  if (!adminExist.length) {
    const newAdmin = await db.insert(users).values({
      email: admin.email,
      password: admin.password,
      first_name: admin.first_name,
      last_name: admin.last_name,
      phone_number: admin.phone,
      address: admin.address,
    }).returning({insertedID: users.user_id}).execute();

    await db.insert(userRoles).values({user_id: newAdmin[0].insertedID, role_id: 1});
    await db.insert(adminStaff).values({user_id: newAdmin[0].insertedID});
  }
  // TODO: add more base state as required
}

main().catch((err) => console.error(err));
