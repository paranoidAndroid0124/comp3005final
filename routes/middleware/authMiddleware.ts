import {onRequestHookHandler} from "fastify/types/hooks";
import jwt from "jsonwebtoken";
import {FastifyRequest} from "fastify";

interface JwtPayload {
    userId: number,
    roleId: number
}

export interface AuthRequest extends FastifyRequest{
    userId: number,
    roleId: number
}

export const  authMiddleware: onRequestHookHandler = (request, reply, done) => {
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
        console.log('payload', payload);
        console.log('payload.userid', payload.userId);
        (request as AuthRequest).userId = payload.userId;
        console.log('token should be verified for userid', (request as AuthRequest).userId);
        done();
    } catch (error) {
        return reply.status(401);
    }
}