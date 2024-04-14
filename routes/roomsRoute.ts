import {FastifyInstance} from "fastify";
import {rooms} from "../src/drizzle/schema";
import {db} from "../db";

export async function roomsRoute(fastify: FastifyInstance, options?) {
    fastify.get('/rooms', async (request, reply) => {
       console.log("Getting all locations");
       try {
           const locationList = await db.select().from(rooms).execute();

           return reply.status(200).send(locationList);
       } catch (error) {
           console.log("Error while getting all locations");
           return reply.status(500).send({error: 'Internal Server Error'});
       }
    });
}