"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const socket_io_1 = require("socket.io");
const node_http_1 = require("node:http");
const server_js_1 = require("../../server.js");
const server_js_2 = require("../../server.js");
const server = (0, node_http_1.createServer)(server_js_1.app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: server_js_2.allowOrigins,
    }
});
