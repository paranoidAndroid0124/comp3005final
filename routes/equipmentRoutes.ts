import { db } from '../db';
import {eq} from "drizzle-orm"; // Update with the correct path to your db connection
import { equipments } from '../src/drizzle/schema';

export async function equipmentRoutes(fastify, options) {
    fastify.get('/equipment', async (request, reply) => {
       try {
           // Logic to return all equipment
           const equipmentsList = await db.select().from(equipments).execute();
           return reply.status(200).send(equipmentsList);
       } catch (error) {
           // handle database errors
           return reply.status(500).send( { error: 'Internal Server Error'});
       }
    });

    fastify.get('/equipment/:id', async (request, reply) => {
       try {
           // Logic to return a specific equipment
           const { id } = request.params;
           //  SELECT * FROM equipments WHERE equipment_id = 'id';
           const equipment = await db.select().from(equipments).where(eq(equipments.equipment_id, id)).execute();

           if (equipment.length === 0) {
               return reply.status(404).send( {error: 'Equipment not found'});
           } else {
               return reply.status(200).send(equipment[0]);
           }
       } catch (error) {
           // handle database errors
           return reply.status(500).send({ error: 'Internal Server Error'});
       }
    });

    fastify.post('/equipment', async (request, reply) => {
       try {
           // Logic to create a new equipment
           const newEquipmentData = request.body;
           const newEquipment = await db.insert(equipments).values(newEquipmentData).execute();
           return reply.status(201).send(newEquipment);
       } catch (error) {
           // handle database errors
           return reply.status(500).send( { error: 'Internal Server Error' })
       }
    });

    // More routes (if needed)
}