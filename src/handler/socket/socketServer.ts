import { Server } from "socket.io";
import { createServer } from 'node:http'
import { createAdapter } from '@socket.io/redis-adapter'
import { app } from "../../server.js";
import { allowOrigins } from "../../server.js";
import { getRedisClient, getRedisStatus } from '../../config/redis'

const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: allowOrigins,
    },
    // Connection stability settings
    pingTimeout: 60000,
    pingInterval: 25000,
})

/**
 * Socket.IO তে Redis adapter সেটআপ করে।
 * এতে multiple server instance এ WebSocket events shared হবে।
 * Redis না থাকলে default in-memory adapter ব্যবহার হবে।
 */
export const setupSocketRedisAdapter = async (): Promise<void> => {
    if (!getRedisStatus()) {
        console.log('[Socket.IO] Redis unavailable – using in-memory adapter')
        return
    }

    try {
        const pubClient = getRedisClient()
        const subClient = pubClient.duplicate()
        await subClient.connect()

        io.adapter(createAdapter(pubClient, subClient) as any)
        console.log('[Socket.IO] Redis adapter connected ✓')
    } catch (err: any) {
        console.error('[Socket.IO] Redis adapter setup failed:', err.message)
        console.log('[Socket.IO] Falling back to in-memory adapter')
    }
}