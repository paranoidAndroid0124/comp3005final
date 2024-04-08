import { db } from '../db';
import { eq } from "drizzle-orm";
import {members, users} from '../src/drizzle/schema';
import {FastifyInstance, FastifyRequest} from "fastify";
import {authMiddleware, AuthRequest} from "./middleware/authMiddleware";

interface profileBody {
    healthMetric: string,
    fitnessGoals: string,
    fitnessAchievements: string
}

export async function membersRoutes(fastify: FastifyInstance, options?) {
    //preValidation or onRequest ?
    fastify.get('/member', {preValidation: [authMiddleware]}, async (request, reply) => {
        console.log("In members route");
        const authRequest = request as AuthRequest;
        console.log('userID', authRequest.userId);
        try {
            // Logic to return all members
            const membersList = await db.select().from(members).execute();
            const memberDetails = [];

            for (const member of membersList) {
                const userDetails = await db.select({
                    first_name: users.first_name,
                    last_name: users.last_name
                }).from(users).where(eq(users.user_id, member.user_id)).execute();

                if (userDetails.length > 0) {
                    const user = userDetails[0];
                    memberDetails.push({
                        user_id: member.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    })
                }
            }

            return reply.status(200).send(memberDetails);
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
                reply.send(member[0]);
            }
        } catch (error) {
            // handle database errors
            reply.status(500).send({ error: 'Internal Server Error'});
        }
    });

    fastify.post<{Params: {id:number}, Body: profileBody}>('/member/:id/update', async (request, reply) => {
        try {
            const {healthMetric, fitnessGoals, fitnessAchievements} = request.body;
            // Logic to update a specific member's data
            const id = request.params.id;
            const member = await db.update(members).set({health_metric: healthMetric, fitness_goals: fitnessGoals, fitness_achievements: fitnessAchievements}).where(eq(members.user_id, id)).returning().execute();

            reply.send(member[0]);
        }catch (error) {
            reply.status(500).send({error: 'Internal Server Error'})
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