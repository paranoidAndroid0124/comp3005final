import { db } from '../db';
import { eq } from "drizzle-orm";
import { members } from '../src/drizzle/schema';
import {FastifyInstance, FastifyRequest} from "fastify";
import {onRequestHookHandler} from "fastify/types/hooks";
import jwt from 'jsonwebtoken';

interface profileBody {
    healthMetric: string,
    fitnessGoals: string,
    fitnessAchievements: string
}

interface JwtPayload {
    userid: number
}

interface AuthRequest extends FastifyRequest{
   userid: number
}

const  test: onRequestHookHandler = (request, reply) => {
   console.log("in test function");
    const headerValue = request.headers.authorization;

    if (!headerValue) {
        console.log("reply 401 cause invalid header");
        return reply.status(401).send();
    }
    try {
        console.log('verify token');
        // Bearer token
        const payload = jwt.verify( headerValue, process.env.JWT_SECRET) as JwtPayload;
        // Get the payload and store
        (request as AuthRequest).userid = payload.userid;
    } catch (error) {
        return reply.status(401);
    }
}

export async function membersRoutes(fastify: FastifyInstance, options?) {
    //preValidation or onRequest ?
    fastify.get('/member', {onRequest: [test]}, async (request, reply) => {
        console.log("In members route");
        const authRequest = request as AuthRequest;
        console.log('userID', authRequest.userid);
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