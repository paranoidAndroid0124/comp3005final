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
            email,
            password: hashedPassword,
            first_name: firstName,
            last_name:lastName,
            phone_number: phoneNumber,
            address
        }).execute();

        reply.send(201);
    });

    fastify.post('/login', async  (request, reply) => {
        const { email, password } = request.body;

        // Retrieve user by email
        const user = await db.select().from(users).where(eq(users.email, email)).execute();

        // if (user && await bcrypt.compare(password, user.password)) { // not sure when I am having issues here
        //     // Passwords match, create JWT
        //     const token = jwt.sgin({ userid: user.user_id}, JWT_SECRET, { expiresIn: '1h'});
        //     reply.send(200);
        // } else {
        //     // Authentication failed
        //     reply.send(401).send({ error: 'Invalid email or password' });
        // }
    });
}