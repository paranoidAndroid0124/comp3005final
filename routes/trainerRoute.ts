import {FastifyInstance} from "fastify";
import {trainer, users} from "../src/drizzle/schema";
import {db} from "../db";
import {eq} from "drizzle-orm";

export async function trainerRoute(fastify: FastifyInstance, options?) {
    fastify.get('/trainer', async (request, reply) => {
       console.log("Getting all trainers");
       try {
           const trainerList = await db.select().from(trainer).execute();
           const trainerDetails = [];

           for (const trainer of trainerList) {
               const userDetails = await db.select({
                   first_name: users.first_name,
                   last_name: users.last_name
               }).from(users).where(eq(users.user_id, trainer.user_id)).execute();

               if (userDetails.length > 0) {
                    const user = userDetails[0];
                    trainerDetails.push({
                        user_id: trainer.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    })
               }
           }
           return reply.status(200).send(trainerDetails);
       } catch (error) {
           console.log("Error while getting all trainers");
           return reply.status(500).send({error: 'Internal Server Error'});
       }
    });
}