import {FastifyInstance} from "fastify";
import {bookings, timeSlots} from "../src/drizzle/schema";
import {db} from "../db";
import {eq, sql} from "drizzle-orm";
import {timestamp} from "drizzle-orm/pg-core";

interface timeSlotRegisterBody {
    user_id: number,
    slot_id: number,
}

interface timeSlotBody {
    title: string
    trainer_id: number,
    startTime: string,
    endTime: string,
    capacity: number,
    room: number,
    price: number,
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
                return reply.status(200).send(timeslot[0]);
            }
        } catch (error) {
            // handle database errors
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Body: timeSlotRegisterBody}>('/timeslot/register', async (request, reply) => {
        try {
            console.log("In register timeslot");
            // would it better in body or as params ?
            const { user_id, slot_id } = request.body;

            console.log("user and slot id", user_id, slot_id);

            //TODO: check if userID and timeSlotID is valid
            await db.insert(bookings).values({
                user_id: user_id,
                slot_id: slot_id
            }).execute();

            console.log("Added registration to bookings")

            // Uptime current enrollment
            // await db.update(timeSlots)
            //     .set({
            //         current_enrollment: sql`${timeSlots.current_enrollment} + 1`
            //     })
            //     .where(eq(timeSlots.slot_id, timeSlotsID ))
            //     .execute();

            // TODO: test to make sure this works
            const slot = await db.select().from(timeSlots).where(eq(timeSlots.slot_id, slot_id)).execute();
            const slotNum = slot[0].current_enrollment + 1;
            // update enrollment
            await db.update(timeSlots).set({ current_enrollment: slotNum}).where(eq(timeSlots.slot_id, slot_id)).execute();

            console.log("Incremented current enrollment");

            return reply.status(201).send();
        } catch (error) {
            console.log("error", error)
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    // this would likely only be done by admin or trainer
    fastify.post<{Body: timeSlotBody}>('/timeslots/add', async (request, reply) => {
        try {
            const { title, trainer_id, startTime, endTime, capacity, room, price} = request.body;

            console.log("startTime, endTime: ", startTime, endTime);
            console.log("Typeof", typeof(startTime), typeof(endTime));
            // TODO: verify that the trainer is available at this time
            // TODO: verify that the user is allowed to add a timeslot
            // TODO: block duplicates
            // Logic to add a timeslot
            const timeslot = await db.insert(timeSlots).values({
                title: title,
                trainer_id: trainer_id,
                start_time: startTime,
                end_time: endTime,
                current_enrollment: 0,
                capacity: capacity,
                room: room,
                price: price,
            }).returning( {slotID: timeSlots.slot_id}).execute();
            return reply.status(201).send(timeslot[0].slotID);
        } catch (error) {
            console.log("Error", error);
            return reply.status(500).send({error: 'Internal Server Error'});
        }
    });

    fastify.post<{Params: {id: number}}>('/timeslots/:id/remove', async (request, reply) => {
        try {
           const id : number = request.params.id;
           // Logic to delete a timeslot
            await db.delete(timeSlots).where(eq(timeSlots.slot_id, id)).execute();

           // TODO: also delete in the bookings table
           // or does the reference do that automatically?
        } catch (error) {
            // handle database errors
            return reply.status(500).send({error: 'Internal Server Errror'});
        }
    });
}
