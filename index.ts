import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import Fastify from "fastify";
import cors from '@fastify/cors'
import fCookie from '@fastify/cookie'

import { membersRoutes } from "./routes/membersRoutes";
import { usersRoutes} from "./routes/usersRoutes";
import { equipmentRoutes } from "./routes/equipmentRoutes";
import { billingRoute } from "./routes/billingRoute";
import {members} from "./src/drizzle/schema";
import { users } from "./src/drizzle/schema";

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });
const queryConnection = postgres(process.env.DATABASE_URL!);

const db = drizzle(queryConnection);


const main = async () => {
  // *** Set up db *** //
  // await setUpDB();

  // *** insert data *** //
  // TODO: can probably do this in schema
  //await insertInitialData();

  // *** Set up and start Fastify server *** //
  const fastify = Fastify({ logger: true });

  fastify.register(cors);

  // fastify.register(require('@fastify/jwt'), {
  //   secret: process.env.JWT_SECRET
  // });

  const fp = require("fastify-plugin")

  module.exports = fp(async function(fastify, opts) {
    fastify.register(require("@fastify/jwt"),{
      secret: process.env.JWT_SECRET
    })
  })

  // hook that will run before every request
  fastify.decorate("authenticate", async function (request, reply) {
    try {
      // verify the token
      await request.jwtVerify();
    } catch (error) {
      return reply.status(500).send({error: 'Invalid jwt token'});
    }
  });

  // TODO: https://www.npmjs.com/package/@fastify/jwt

  // Declare a route
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });

  await membersRoutes(fastify);
  await usersRoutes(fastify);
  // fastify.register(membersRoutes); // these route don't work
  // fastify.register(equipmentRoutes);
  // fastify.register(billingRoute);
  // fastify.register(fastify, options => {
  //
  // })

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
  // TODO: populate roles
  // admin, member and trainer

  // create first user
  const result = await db.insert(users).values({first_name: 'test', last_name: 'User', email: 'john.doe@example.com', password: 'test', phone_number: '819-666-1234', address: 'jane street'}).returning({data: users.user_id }).execute();
  console.log("Result:", result[0].data);
  await db.insert(members).values({user_id: result[0].data, health_metric: 'health', fitness_goals: 'blah', fitness_achievements: 'none', join_date: '2023-09-01'})
}

main().catch((err) => console.error(err));
