// custom-types.d.ts
import 'fastify';
import {FastifyReply, FastifyRequest} from "fastify";

// declare module 'fastify' {
//     export interface FastifyInstance {
//         authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
//     }
// }
declare global {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}