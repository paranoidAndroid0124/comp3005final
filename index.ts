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
import { roomsRoute } from "./routes/roomsRoute";
import {
  adminStaff,
  equipments,
  exercises,
  members,
  roles,
  rooms, routine, routineExercise,
  timeSlots,
  trainer,
  userRoles
} from "./src/drizzle/schema";
import { users } from "./src/drizzle/schema";
import {and, eq} from "drizzle-orm";
import {trainerRoute} from "./routes/trainerRoute";
import bcrypt from "bcrypt";
import {exerciseRoutes} from "./routes/exerciseRoutes";

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
  await exerciseRoutes(fastify);
  await roomsRoute(fastify);

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
  // Add exercises
  const exercisesToAdd = [
    { "exercise_id": 1, "exercise_name": "Push-ups", "reps": 10, "duration": "30s" },
    { "exercise_id": 2, "exercise_name": "Sit-ups", "reps": 15, "duration": "45s" },
    { "exercise_id": 3, "exercise_name": "Jumping Jacks", "reps": 20, "duration": "60s" },
    { "exercise_id": 4, "exercise_name": "Burpees", "reps": 10, "duration": "40s" },
    { "exercise_id": 5, "exercise_name": "Squats", "reps": 15, "duration": "50s" },
    { "exercise_id": 6, "exercise_name": "Lunges", "reps": 12, "duration": "40s" },
    { "exercise_id": 7, "exercise_name": "Plank", "reps": 1, "duration": "60s" },
    { "exercise_id": 8, "exercise_name": "Mountain Climbers", "reps": 20, "duration": "60s" },
    { "exercise_id": 9, "exercise_name": "High Knees", "reps": 20, "duration": "60s" },
    { "exercise_id": 10, "exercise_name": "Leg Raises", "reps": 15, "duration": "45s" },
    { "exercise_id": 11, "exercise_name": "Russian Twists", "reps": 20, "duration": "60s" },
    { "exercise_id": 12, "exercise_name": "Bicycle Crunches", "reps": 20, "duration": "60s" },
    { "exercise_id": 13, "exercise_name": "Side Plank Left", "reps": 1, "duration": "30s" },
    { "exercise_id": 14, "exercise_name": "Side Plank Right", "reps": 1, "duration": "30s" },
    { "exercise_id": 15, "exercise_name": "Tuck Jumps", "reps": 10, "duration": "30s" },
    { "exercise_id": 16, "exercise_name": "Box Jumps", "reps": 10, "duration": "40s" },
    { "exercise_id": 17, "exercise_name": "Wall Sit", "reps": 1, "duration": "45s" },
    { "exercise_id": 18, "exercise_name": "Calf Raises", "reps": 20, "duration": "60s" },
    { "exercise_id": 19, "exercise_name": "Flutter Kicks", "reps": 20, "duration": "45s" },
    { "exercise_id": 20, "exercise_name": "Arm Circles", "reps": 15, "duration": "30s" }
  ]
  for (const exerciseItem of exercisesToAdd) {
    const exerciseExist = await db.select().from(exercises).where(eq(exercises.exercise_name, exerciseItem.exercise_name));

    if (!exerciseExist.length) {
      await db.insert(exercises).values({
        exercise_name: exerciseItem.exercise_name,
        reps: exerciseItem.reps,
        duration: exerciseItem.duration,
      }).execute();
    }
  }
  // Add routine
  const routineToAdd = [
    { "routine_name": "My first routine"},
    { "routine_name": "Advance routine"},
    { "routine_name": "Best routine"},
  ]
  for (const routineItem of routineToAdd) {
    try {
      // Check if a routine with the same routine_id AND exercise_id already exists
      const existingRoutine = await db.select().from(routine)
          .where(and(
              eq(routine.routine_name, routineItem.routine_name),
          )).execute();

      // Insert the new routine if it does not already exist
      if (!existingRoutine.length) {
        await db.insert(routine)
            .values({
              routine_name: routineItem.routine_name
            }).execute();
      }
    } catch (error) {
      console.error("Error inserting data: ", error.message);
      // Handle errors appropriately in your application context
    }
  }
  // add some exercise to routine
  const exerciseToMap = [
    {"routine_id" : 1, "exercise_id": 1},
    {"routine_id" : 1, "exercise_id": 2},
    {"routine_id" : 1, "exercise_id": 3},
    {"routine_id" : 1, "exercise_id": 4},
    {"routine_id" : 2, "exercise_id": 1}
  ]
  for (const exerciseMap of exerciseToMap) {
    const exerciseMapExist = await db.select().from(routineExercise).where(
        and(eq(routineExercise.routine_id, exerciseMap.routine_id), eq(routineExercise.exercise_id, exerciseMap.exercise_id))).execute();

    if (!exerciseMapExist.length) {
      await db.insert(routineExercise).values({
        routine_id: exerciseMap.routine_id,
        exercise_id: exerciseMap.exercise_id,
      }).execute();
    }
  }
  // Add timeSlots
  const timeSlotsToAdd = [
    {
      "trainer_id" : 1,
      "start_time": "2024-04-07T07:00:00",
      "end_time": "2024-04-07T09:00:00",
      "title": "Morning Session",
      "location": "Room 101",
      "capacity": 50,
      "current_enrollment": 0,
      "price": 0
    },
    {
      "trainer_id" : 1,
      "start_time": "2024-04-07T11:00:00",
      "end_time": "2024-04-07T13:00:00",
      "title": "Midday Session",
      "location": "Room 102",
      "capacity": 60,
      "current_enrollment": 0,
      "price": 10
    },
    {
      "trainer_id" : 1,
      "start_time": "2024-04-07T15:00:00",
      "end_time": "2024-04-07T17:00:00",
      "title": "Afternoon Session",
      "location": "Room 103",
      "capacity": 70,
      "current_enrollment": 0,
      "price": 15
    },
    {
      "trainer_id" : 1,
      "start_time": "2024-04-07T19:00:00",
      "end_time": "2024-04-07T21:00:00",
      "title": "Evening Session",
      "location": "Room 104",
      "capacity": 80,
      "current_enrollment": 0,
      "price": 20
    },
    {
      "trainer_id" : 2,
      "start_time": "2024-04-08T07:00:00",
      "end_time": "2024-04-08T09:00:00",
      "title": "Morning Session 2",
      "location": "Room 105",
      "capacity": 50,
      "current_enrollment": 0,
      "price": 0
    },
    {
      "trainer_id" : 2,
      "start_time": "2024-04-08T11:00:00",
      "end_time": "2024-04-08T13:00:00",
      "title": "Midday Session 2",
      "location": "Room 106",
      "capacity": 60,
      "current_enrollment": 0,
      "price": 10
    },
    {
      "trainer_id" : 2,
      "start_time": "2024-04-08T15:00:00",
      "end_time": "2024-04-08T17:00:00",
      "title": "Afternoon Session 2",
      "location": "Room 107",
      "capacity": 70,
      "current_enrollment": 0,
      "price": 15
    },
    {
      "trainer_id" : 3,
      "start_time": "2024-04-08T19:00:00",
      "end_time": "2024-04-08T21:00:00",
      "title": "Evening Session 2",
      "location": "Room 108",
      "capacity": 80,
      "current_enrollment": 0,
      "price": 20
    },
    {
      "trainer_id" : 3,
      "start_time": "2024-04-09T07:00:00",
      "end_time": "2024-04-09T09:00:00",
      "title": "Morning Session 3",
      "location": "Room 109",
      "capacity": "50",
      "current_enrollment": 0,
      "price": 0
    },
    {
      "trainer_id" : 3,
      "start_time": "2024-04-09T11:00:00",
      "end_time": "2024-04-09T13:00:00",
      "title": "Midday Session 3",
      "location": "Room 110",
      "capacity": 60,
      "current_enrollment": 0,
      "price": 10
    }
  ]
  for (const timeslotItem of timeSlotsToAdd) {
    const timeSlotExist = await db.select().from(timeSlots).where(eq(timeSlots.title, timeslotItem.title)).execute();

    if (!timeSlotExist.length) {
      // @ts-ignore
      await db.insert(timeSlots).values({
        title: timeslotItem.title,
        trainer_id: timeslotItem.trainer_id,
        start_time: timeslotItem.start_time,
        end_time: timeslotItem.end_time,
        current_enrollment: timeslotItem.current_enrollment,
        capacity: timeslotItem.capacity,
        room: 1,
        price: timeslotItem.price,
      }).execute();
    }
  }
  // TODO: add more base state as required
}

main().catch((err) => console.error(err));
