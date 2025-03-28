"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../../server");
const removeActiveUser = (id) => {
    const index = server_1.activeUsers.indexOf(id);
    if (index > -1) {
        server_1.activeUsers.splice(index, 1); // ইউজার আইডি মুছে ফেলা
    }
};
exports.default = removeActiveUser;
