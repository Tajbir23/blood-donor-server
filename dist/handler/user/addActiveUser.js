"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../server");
const addActiveUser = (id) => {
    if (server_1.activeUsers.includes(id)) {
        const index = server_1.activeUsers.indexOf(id);
        if (index > -1) {
            server_1.activeUsers.splice(index, 1);
        }
    }
    server_1.activeUsers.push(id);
};
exports.default = addActiveUser;
