import { db } from '../db';
import {eq} from "drizzle-orm"; // Update with the correct path to your db connection
import { equipments } from '../src/drizzle/schema';
import {FastifyInstance} from "fastify";

interface equipmentBody {
    equipmentID: number,
    equipmentName: string,
    lastMaintained: string,
    nextMaintained: string,
}

export async function equipmentRoutes(fastify: FastifyInstance, options?) {
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

    fastify.get<{Params: {id: number}}>('/equipment/:id', async (request, reply) => {
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

    fastify.post<{Body: equipmentBody}>('/equipment/add', async (request, reply) => {
       try {
           const {equipmentID, equipmentName, lastMaintained, nextMaintained} = request.body;
           // Logic to create a new equipment
           const newEquipment = await db.insert(equipments).values({
               equipment_id: equipmentID,
               equipment_name: equipmentName,
               last_maintained: lastMaintained,
               next_maintained: nextMaintained
           }).returning({equipmentID: equipments.equipment_id}).execute();
           return reply.status(201).send(newEquipment);
       } catch (error) {
           // handle database errors
           return reply.status(500).send( { error: 'Internal Server Error' })
       }
    });

    fastify.post<{Body: equipmentBody}>('/equipment/updateMaintenance', async (request, reply) => {
        try {
            console.log("Request.body: ", request.body)
            const {equipmentID} = request.body;

            // Logic to set lastMaintained to current day, and nextMaintained to next year from now
            console.log(new Date().toISOString().slice(0, 10))
            const updatedEquipment: {updatedId: number}[] = await db.update(equipments)
                .set({last_maintained: new Date().toISOString(),
                      next_maintained: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
                })
                .where(eq(equipments.equipment_id, equipmentID))
                .returning( {updatedId: equipments.equipment_id});

            console.log("Updated equipment: ", updatedEquipment)

            return reply.status(201).send(updatedEquipment);
        } catch(err){
            console.log("Error: ", err)
            return reply.status(500).send( { error: 'Internal Server Error'})
        }
    })

    // More routes (if needed)
}