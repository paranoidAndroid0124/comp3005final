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
            const timeslot = await db.select().from(timeSlots).where(eq(timeSlots.Slot_id, id)).execute()

            if (timeslot.length ===0) {
                reply.status(404).send({error: 'Timeslot does not exist'});
            } else {
                reply.send(timeslot[0]);
            }
        } catch (error) {
            // handle database errors
            reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Params: {id: number}, Body: timeSlotBody}>('/timeslots/:id/add', async (request, reply) => {
        try {
            const { trainer, startTime, endTime, capacity, location} = request.body;

            // TODO: verify that the trainer is available at this time
            // Logic to add a timeslot
            const timeslot = await db.insert(timeSlots).value({
                trainer_id: trainer,
                start_time: startTime,
                end_time: endTime,
                current_enrollment: 0,
                capacity: capacity,
                location: location
            }).returning( {slotID: timeslot.Slot_id}).execute();
            return reply.status(201).send(slotID);
        } catch (error) {
            reply.status(500).send({error: 'Internal Server Error'})
        }
    });
}
