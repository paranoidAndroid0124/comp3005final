import { db } from '../db';
import { eq } from "drizzle-orm";
import { members } from '../src/drizzle/schema';
import {FastifyInstance} from "fastify";

export async function membersRoutes(fastify: FastifyInstance, options?) {
    fastify.get('/member', async (request, reply) => {
        console.log("In members route");
        try {
            // Logic to return all members
            const membersList = await db.select().from(members).execute();
            return reply.status(200).send(membersList);
        } catch (error) {
            console.log("Error in member route");
            // handle database errors
            return reply.status(500).send( {error: 'Internal Server Error'});
        }
    });

    fastify.get<{Params: {id: number}}>('/member/:id', async (request, reply) => {
        try {
            // Logic to return a specific member
            const id  = request.params.id;
            const member = await db.select().from(members).where(eq(members.user_id, id)).execute();

            if (member.length === 0) {
                reply.status(404).send({ error: 'Member not found' });
            } else {
                reply.send(member[0])
            }
        } catch (error) {
            // handle database errors
            reply.status(500).send({ error: 'Internal Server Error'});
        }
    });

    fastify.post('/member', async (request, reply) => {
        try {
            // Logic to create a new member
            const newMemberData = request.body;
            const  newMember = await db.insert(members).values(newMemberData).execute();
            reply.status(201).send(newMember);
        } catch (error) {
            // handle database errors
            reply.status(500).send({ error: 'Internal Server Error' })
        }
    });

    // More routes (if needed)
}