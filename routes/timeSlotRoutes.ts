import {FastifyInstance} from "fastify";
import {members, timeSlots} from "../src/drizzle/schema";
import {db} from "../db";
import * as repl from "repl";
import {eq} from "drizzle-orm";

interface timeSlotBody {

}

export async function timeSlotRoutes(fastify: FastifyInstance, options?) {
    fastify.get('/timeslots', async (request,reply) => {
        console.log("In timeslot route");
        try {
            // Logic to get all timeslots
            const timeSlotList = await db.select().from(timeSlots).execute();
            return reply.status(200).send(timeSlotList);
        }catch (error) {
            console.log("Error while getting timeslots list")
            // handle database errors
            return reply.status(500).send({error: 'Internal Server Error'})
        }
    });

    fastify.get<{Params: {id: number}}>('/timeslots/:id', async (request, reply) => {
        try {
            // Logic to return a specific member
            const id : number = request.params.id;
            const timeslot = await db.select().from(timeSlots).where(eq(timeSlots.slot_id, id)).execute()

            if (timeslot.length === 0) {
                return reply.status(404).send({error: 'Timeslot does not exist'});
            } else {
                return reply.send(timeslot[0]);
            }
        } catch (error) {
            // handle database errors
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Body: timeSlotBody}>('/timeslot/register', async (request, reply) => {
        try {
            // would it better in body or as params ?
            const { userID, timeslotID } = request.body;

            //TODO: check if userID and timeSlotID is valid
            await db.insert(bookings).value({
                user_id: userID,
                slot_id: slotID
            }).execute();

            return reply.status(201);
        } catch (error) {
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Body: timeSlotBody}>('/timeslots/add', async (request, reply) => {
        try {
            const { trainer, startTime, endTime, capacity, location} = request.body;

            // TODO: verify that the trainer is available at this time
            // TODO: verify that the user is allowed to add a timeslot
            // Logic to add a timeslot
            const timeslot = await db.insert(timeSlots).value({
                trainer_id: trainer,
                start_time: startTime,
                end_time: endTime,
                current_enrollment: 0,
                capacity: capacity,
                location: location
            }).returning( {slotID: timeslot.slot_id}).execute();
            return reply.status(201).send(slotID);
        } catch (error) {
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Params: {id: number}}>('/timeslots/:id/remove', async (request, reply) => {
        try {
           const id : number = request.params.id;
           // Logic to delete a timeslot
            await db.delete.from(timeSlots).where(eq(slot_id, id)).execute();

           // TODO: also delete in the bookings table
           // or does the reference do that automatically?
        } catch (error) {
            // handle database errors
            return reply.status(500).send({error: 'Internal Server Errror'});
        }
    });
}
