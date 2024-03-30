import "dotenv/config";
import { db } from '../db';
import { eq } from "drizzle-orm";
import { users } from "../src/drizzle/schema";
import { bcrypt } from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function usersRoute(fastify, options) {
    // Registration endpoint
    fastify.post('/register', async (request, reply) => {
        const { email, password, firstName, lastName, phoneNumber, address} = request.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        await db.insert(users).values({
            email: email,
            password: hashedPassword,
            first_name: firstName,
            last_name:lastName,
            phone_number: phoneNumber,
            address: address
        }).execute();

        return reply.send(201);
    });

    fastify.post('/login', async  (request, reply) => {
        const { email, password } = request.body;

        // Retrieve user by email
        const user = await db.select().from(users).where(eq(users.email, email)).execute();

        if (user && await bcrypt.compare(password, user[0].password)) {
            // Passwords match, create JWT
            const token = jwt.sign({ userid: user[0].user_id}, process.env.JWT_SECRET, { expiresIn: '1h'});
            return reply.status(200).send(token);
        } else {
            // Authentication failed
            return reply.status(401).send({ error: 'Invalid email or password' });
        }
    });
}