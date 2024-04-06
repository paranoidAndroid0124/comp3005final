import "dotenv/config";
import { db } from '../db';
import {count, eq} from "drizzle-orm";
import {adminStaff, members, users} from "../src/drizzle/schema";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {FastifyInstance} from "fastify";

interface RegisterBody {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string
    address: string
}

interface LoginBody {
    email: string,
    password: string
}

export async function usersRoutes(fastify: FastifyInstance, options?) {
    // Registration endpoint
    fastify.post<{Body: RegisterBody}>('/register', async (request, reply) => {
        try {
            const { email, password, firstName, lastName, phoneNumber, address} = request.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            const newUser = await db.insert(users).values({
                email: email,
                password: hashedPassword,
                first_name: firstName,
                last_name:lastName,
                phone_number: phoneNumber,
                address: address
            }).returning( {insertedID: users.user_id}).execute();

            // Check if this is the first user
            const userCount = await db.select( {count: count()}).from(users).execute();

            if (userCount[0].count === 1) {
                // This is the first user, insert them into the adminStaff table
                await db.insert(adminStaff).values({user_id: newUser[0].insertedID});
            } else {
                // insert new user as a member by default
                await db.insert(members).values({
                    user_id: newUser[0].insertedID,
                    health_metric: '',
                    fitness_goals: '',
                    fitness_achievements: '',
                    join_date: new Date().toISOString().slice(0, 10)
                });
            }
            return reply.status(201).send();
        } catch (error) {
            console.error("Error during registration", error);

            return reply.status(500).send({error: 'Internal Server Error'});
        }

    });

    fastify.post<{Body: LoginBody}>('/login', async  (request, reply) => {
        const { email, password } = request.body;

        // Retrieve user by email
        const user = await db.select().from(users).where(eq(users.email, email)).execute();

        if (user && await bcrypt.compare(password, user[0].password)) {
            // Passwords match, create JWT
            const token = jwt.sign({ userid: user[0].user_id}, process.env.JWT_SECRET, { expiresIn: '1h'});
            // return reply.status(200).send(token);
            return reply.status(200).send(user[0].user_id);
        } else {
            // Authentication failed
            return reply.status(401).send({ error: 'Invalid email or password' });
        }
    });
}
