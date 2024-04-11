import { db } from '../db';
import {eq} from "drizzle-orm";
import { billingInformation } from '../src/drizzle/schema';
import {FastifyInstance} from "fastify";

interface billingBody {
    userId: number,
    periodicity: string,
    cardType: string,
    cardHolder: string,
    cardNumber: string,
    expiry: string, // date in postgres
}

export async function billingRoute(fastify: FastifyInstance, options?) {
    fastify.get<{Params: {id: number}}>('/member/billing/:id', async (request, reply) => {
       try {
           // Extract memberID from the route parameters
           const { id } = request.params;

           // Fetch the billing information from database
           const billingInfo = await db.select().from(billingInformation).where(eq(billingInformation.user_id, id)).execute();

           // Check if billing info is found
           if (billingInfo.length === 0) {
               return reply.status(404).send({ message: 'Billing information not found for this member.'});
           }

           // Send the billing info
           return reply.send(billingInfo);
       } catch (error) {
           // handle database errors
           return reply.status(500).send( {error: 'Internal Server Error'});
       }
    });

    fastify.post<{Body: billingBody}>('/member/billing/add', async (request, reply) => {
        try {
            // Extract billing info from body
            const {userId,periodicity, cardType, cardHolder, cardNumber, expiry} = request.body;

            // Check if billing information already exist
            const billingInfo = await db.select().from(billingInformation).where(eq(billingInformation.user_id, userId)).execute();

            if (!billingInfo.length) {
                await db.insert(billingInformation).values({
                    user_id: userId,
                    periodicity: periodicity,
                    card_type: cardType,
                    card_holder: cardHolder,
                    card_number: cardNumber,
                    expiry: expiry,
                }).execute();
            } else {
                return reply.status(500).send({error: 'Billing info already exist'});
            }
        } catch (error) {
            // handle database
            return reply.status(500).send( {error: 'Internal Server Error'});
        }
    });

    fastify.post('/member/payment/add', async (request, reply) => {
        try {
            // Extract payment info from body
            // TODO

            // TODO: db query
        }
    })
}