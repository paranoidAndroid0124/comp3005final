import { db } from '../db';
import {eq} from "drizzle-orm"; // Update with the correct path to your db connection
import { members } from '../src/drizzle/schema';

export async function membersRoutes(fastify, options) {
    fastify.get('/member', async (request, reply) => {
        try {
            // Logic to return all members
            const membersList = await db.select().from(members).execute();
            reply.send(membersList);
        }
        catch (error) {
            // handle database errors
            reply.send(500).send( {error: 'Internal Server Error'});
        }
    });

    fastify.get('/member/:id', async (request, reply) => {
        try {
            // Logic to return a specific member
            const { id } = request.params;
            const member = await db.select().from(members).where(eq(members.member_id, id)).execute();

            if (member.length === 0) {
                reply.status(404).send({ error: 'Member no found' });
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

    // More route (if needed)
}