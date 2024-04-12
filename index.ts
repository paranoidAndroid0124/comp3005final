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
import {adminStaff, equipments, members, roles, rooms, timeSlots, trainer, userRoles} from "./src/drizzle/schema";
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

  // register all routes
  await membersRoutes(fastify);
  await usersRoutes(fastify);
  await timeSlotRoutes(fastify);
  await trainerRoute(fastify);
  await equipmentRoutes(fastify);
  await billingRoute(fastify);

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
  // add members
  const membersToAdd = [
    {first_name: 'maxime', last_name: 'gagne', email: 'max@gagne.com', password: hashedPassword, phone: '1234567890', address: 'doe street'},
    {first_name: 'vincent', last_name: 'gagnon', email: 'vincent@gagnon.com', password: hashedPassword, phone: '1234567890', address: '5 vince street'},
    {first_name: 'Joe', last_name: 'rich', email: 'joe@rich.com', password: hashedPassword, phone: '1234567890', address: '2 rich street'},
  ]
  console.log("checking if members already exist")
  for (const member of membersToAdd) {
    // Check if user already exists based on their email
    const memberExists = await db.select().from(users).where(eq(users.email, member.email)).execute();
    console.log(memberExists);
    if(!memberExists.length) {
      console.log("adding new member");
      const newUser = await db.insert(users).values({
        email: member.email,
        password: member.password,
        first_name: member.first_name,
        last_name: member.last_name,
        phone_number: member.phone,
        address: member.address,
      }).returning({insertedID: users.user_id}).execute();

      await db.insert(userRoles).values({user_id: newUser[0].insertedID, role_id: 2 });
      await db.insert(members).values({
        user_id: newUser[0].insertedID,
        health_metric: '',
        fitness_goals: '',
        fitness_achievements: '',
        join_date: new Date().toISOString().slice(0, 10)
      }).execute();
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
  // add equipment
  const equipmentToAdd = [
    {equipment_id: 1, equipment_name: 'smith machine', last_maintained: '2023-09-01', next_maintained: '2024-09-01'},
    {equipment_id: 2, equipment_name: 'bench', last_maintained: '2023-09-01', next_maintained: '2030-09-01'},
    {equipment_id: 3, equipment_name: 'leg press', last_maintained: '2023-09-01', next_maintained: '2025-09-01'},
  ]
  for (const equipment of equipmentToAdd) {
    const equipmentExist = await db.select().from(equipments).where(eq(equipments.equipment_id, equipment.equipment_id)).execute();

    if (!equipmentExist.length) {
      await db.insert(equipments).values({
        equipment_id: equipment.equipment_id,
        equipment_name: equipment.equipment_name,
        last_maintained: equipment.last_maintained,
        next_maintained: equipment.next_maintained,
      }).execute();
    }
  }
  // add rooms
  const roomToAdd = [
    {room_name: "main room", room_capacity: 100},
    {room_name: "cardio room", room_capacity: 100},
    {room_name: "weight room", room_capacity: 100},
  ]
  for (const room of roomToAdd) {
    const roomExist = await db.select().from(rooms).where(eq(rooms.room_name, room.room_name)).execute();

    if (!roomExist.length) {
      await db.insert(rooms).values({
        room_name: room.room_name,
        room_capacity: room.room_capacity
      }).execute();
    }
  }
  // TODO: add more base state as required
}

main().catch((err) => console.error(err));
