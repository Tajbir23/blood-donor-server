"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../config/redis");
const ACTIVE_USERS_KEY = 'active_users';
/**
 * Redis Set থেকে user ID সরিয়ে দেয়।
 * Redis unavailable হলে silently skip করে।
 */
const removeActiveUser = async (id) => {
    if (!(0, redis_1.getRedisStatus)())
        return;
    try {
        const client = (0, redis_1.getRedisClient)();
        await client.sRem(ACTIVE_USERS_KEY, id.toString());
    }
    catch (err) {
        console.error('[Redis] removeActiveUser failed:', err.message);
    }
};
exports.default = removeActiveUser;
