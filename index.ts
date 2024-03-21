import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { promisify } from "node:util";
import { createInterface} from "node:readline";
import Fastify from 'fastify';

import { membersRoutes } from './routes/membersRoutes';
import {eq} from "drizzle-orm";

const migrationConnection = postgres(process.env.DATABASE_URL!, { max: 1 });
const queryConnection = postgres(process.env.DATABASE_URL!);

const db = drizzle(queryConnection);

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

const  questionAsync = promisify(readline.question).bind(readline);

const main = async () => {
    // *** Set up db *** //
    // await setUpDB();

    // *** insert data *** //
    // TODO: can probably do this in schema
    //await insertInitialData();

    // *** Set up and start Fastify server *** //
    const fastify = Fastify({ logger: true});

    // Declare a route
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    fastify.register(membersRoutes);

    console.log('Starting server');
    // Run the server!
    try {
        await fastify.listen({ port: 3000 });
        const address = fastify.server.address();
        const port = typeof address === 'string' ? address : address?.port;

        console.log('server listening on ${port}');
        fastify.log.info(`server listening on ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

async function setUpDB():Promise<void> {
    await migrate(drizzle(migrationConnection), { migrationsFolder: 'src/drizzle' });
    await migrationConnection.end();

}

async function insertInitialData():Promise<void> {
    // await db.insert(student).values({first_name: 'john', last_name: 'Doe', email: 'john.doe@example.com', enrollment_date: '2023-09-01'}).execute();
    // await db.insert(student).values({first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', enrollment_date: '2023-09-01'}).execute();
    // await db.insert(student).values({first_name: 'Jim', last_name: 'Beam', email: 'jim.beam@example.com', enrollment_date: '2023-09-02'}).execute();
}

main().catch(err => console.error(err));
