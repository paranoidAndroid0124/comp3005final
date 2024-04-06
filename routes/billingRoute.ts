import { db } from '../db';
import {eq} from "drizzle-orm"; // Update with the correct path to your db connection
import { billingInformation } from '../src/drizzle/schema';
import {FastifyInstance} from "fastify";

//export async function billingRoute(fastify: FastifyInstance): Promise<void> {
export async function billingRoute(fastify, options) {
    fastify.get('/member/:memberId/billing', async (request, reply) => {
       try {
           // Extract memberID from the route parameters
           const { memberId } = request.params;

           // Fetch the billing information from database
           const billingInfo = await db.select().from(billingInformation).where(eq(billingInformation.user_id, memberId)).execute();

           // Check if billing info is found
           if (billingInfo.length ===0) {
               return reply.status(404).send({ message: 'Billing information not found for this member.'});
           }

           // Send the billing info
           return reply.send(billingInfo);
       } catch (error) {
           // handle database errors
           return reply.status(500).send( {error: 'Internal Server Error'});
       }
    });
}