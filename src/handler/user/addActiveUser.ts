import { getRedisClient, getRedisStatus } from '../../config/redis'

const ACTIVE_USERS_KEY = 'active_users'
const USER_TTL = 60 * 60 * 24 // 24 ঘন্টা পর auto-expire

/**
 * Redis Set এ user ID যোগ করে।
 * Redis unavailable হলে silently skip করে (server crash হবে না)।
 */
const addActiveUser = async (id: string): Promise<void> => {
    if (!getRedisStatus()) return

    try {
        const client = getRedisClient()
        // Set এ add করে — duplicate auto-handled
        await client.sAdd(ACTIVE_USERS_KEY, id.toString())
        // TTL refresh — 24hr পর সব expire হবে
        await client.expire(ACTIVE_USERS_KEY, USER_TTL)
    } catch (err: any) {
        console.error('[Redis] addActiveUser failed:', err.message)
    }
}

export default addActiveUser