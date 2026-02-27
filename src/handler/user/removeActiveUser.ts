import { getRedisClient, getRedisStatus } from '../../config/redis'

const ACTIVE_USERS_KEY = 'active_users'

/**
 * Redis Set থেকে user ID সরিয়ে দেয়।
 * Redis unavailable হলে silently skip করে।
 */
const removeActiveUser = async (id: string): Promise<void> => {
    if (!getRedisStatus()) return

    try {
        const client = getRedisClient()
        await client.sRem(ACTIVE_USERS_KEY, id.toString())
    } catch (err: any) {
        console.error('[Redis] removeActiveUser failed:', err.message)
    }
}

export default removeActiveUser