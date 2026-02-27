"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketRedisAdapter = exports.io = void 0;
const socket_io_1 = require("socket.io");
const node_http_1 = require("node:http");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const server_js_1 = require("../../server.js");
const server_js_2 = require("../../server.js");
const redis_1 = require("../../config/redis");
const server = (0, node_http_1.createServer)(server_js_1.app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: server_js_2.allowOrigins,
    },
    // Connection stability settings
    pingTimeout: 60000,
    pingInterval: 25000,
});
/**
 * Socket.IO তে Redis adapter সেটআপ করে।
 * এতে multiple server instance এ WebSocket events shared হবে।
 * Redis না থাকলে default in-memory adapter ব্যবহার হবে।
 */
const setupSocketRedisAdapter = async () => {
    if (!(0, redis_1.getRedisStatus)()) {
        console.log('[Socket.IO] Redis unavailable – using in-memory adapter');
        return;
    }
    try {
        const pubClient = (0, redis_1.getRedisClient)();
        const subClient = pubClient.duplicate();
        await subClient.connect();
        exports.io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        console.log('[Socket.IO] Redis adapter connected ✓');
    }
    catch (err) {
        console.error('[Socket.IO] Redis adapter setup failed:', err.message);
        console.log('[Socket.IO] Falling back to in-memory adapter');
    }
};
exports.setupSocketRedisAdapter = setupSocketRedisAdapter;
