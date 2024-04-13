import {FastifyInstance} from "fastify";
import {db} from "../db";
import {exercises} from "../src/drizzle/schema";

interface memberExerciseBody {
    user_id: number;
}

export async function exerciseRoutes(fastify: FastifyInstance, options?) {
    fastify.get('/exercises', async (request, reply) => {
        console.log("In exercises route");
        try {
            const exercisesList = await db.select().from(exercises).execute();


            return reply.status(200).send(exercisesList);
        }catch (error) {
            // handle db error
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    // give a user_id return all exercises
    fastify.get<{Body: memberExerciseBody}>('/member/exercises', async (request, reply) => {
       console.log("In member exercises");
       try {
           // TODO complete query
           const {user_id}  = request.body;
       } catch (error) {
           return reply.status(500).send({error: 'Internal Server Error'});
       }
    });
}