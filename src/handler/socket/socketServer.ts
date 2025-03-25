import { Server } from "socket.io";
import {createServer} from 'node:http'
import { app } from "../../server.js";
import { allowOrigins } from "../../server.js";

const server = createServer(app)
export const io = new Server(server, {
    cors: {
        origin: allowOrigins,
    }
})