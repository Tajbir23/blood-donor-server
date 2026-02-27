"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../config/redis");
const ACTIVE_USERS_KEY = 'active_users';
const USER_TTL = 60 * 60 * 24; // 24 ঘন্টা পর auto-expire
/**
 * Redis Set এ user ID যোগ করে।
 * Redis unavailable হলে silently skip করে (server crash হবে না)।
 */
const addActiveUser = async (id) => {
    if (!(0, redis_1.getRedisStatus)())
        return;
    try {
        const client = (0, redis_1.getRedisClient)();
        // Set এ add করে — duplicate auto-handled
        await client.sAdd(ACTIVE_USERS_KEY, id.toString());
        // TTL refresh — 24hr পর সব expire হবে
        await client.expire(ACTIVE_USERS_KEY, USER_TTL);
    }
    catch (err) {
        console.error('[Redis] addActiveUser failed:', err.message);
    }
};
exports.default = addActiveUser;
