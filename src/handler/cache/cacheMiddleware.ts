import { Request, Response, NextFunction } from 'express'
import { getRedisClient, getRedisStatus } from '../../config/redis'

/**
 * Redis-backed response cache middleware।
 * শুধু GET request cache করে। POST/PUT/DELETE skip করে।
 * 
 * ব্যবহার:
 *   router.get('/donors', cacheMiddleware(300), getDonors)   // 5 মিনিট cache
 *   router.get('/home', cacheMiddleware(600), getHome)       // 10 মিনিট cache
 * 
 * @param ttlSeconds - cache expire time in seconds (default: 300 = 5 min)
 */
export const cacheMiddleware = (ttlSeconds: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // শুধু GET request cache করবে
        if (req.method !== 'GET') return next()

        // Redis connected না থাকলে skip
        if (!getRedisStatus()) return next()

        const cacheKey = `cache:${req.originalUrl}`

        try {
            const client = getRedisClient()
            const cachedData = await client.get(cacheKey) as string | null

            if (cachedData) {
                // Cache hit — সরাসরি cached response পাঠাও
                const parsed = JSON.parse(cachedData)
                res.setHeader('X-Cache', 'HIT')
                res.status(200).json(parsed)
                return
            }

            // Cache miss — original response intercept করে cache এ রাখো
            const originalJson = res.json.bind(res)
            res.json = (body: any) => {
                // শুধু successful response cache করো
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    client.setEx(cacheKey, ttlSeconds, JSON.stringify(body))
                        .catch(err => console.error('[Cache] Set failed:', err.message))
                }
                res.setHeader('X-Cache', 'MISS')
                return originalJson(body)
            }

            next()
        } catch (err: any) {
            console.error('[Cache] Middleware error:', err.message)
            next() // Error হলেও request block হবে না
        }
    }
}

/**
 * নির্দিষ্ট cache key বা pattern delete করে।
 * Data update হলে call করবে (POST/PUT/DELETE handler এ)।
 * 
 * ব্যবহার:
 *   await invalidateCache('/api/home*')     // home route এর সব cache clear
 *   await invalidateCache('/api/blood*')    // blood route এর সব cache clear
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
    if (!getRedisStatus()) return

    try {
        const client = getRedisClient()
        const keys = await client.keys(`cache:${pattern}`)
        
        if (keys.length > 0) {
            await client.del(keys)
            console.log(`[Cache] Invalidated ${keys.length} keys matching: ${pattern}`)
        }
    } catch (err: any) {
        console.error('[Cache] Invalidation failed:', err.message)
    }
}

/**
 * সব cache একসাথে clear করে।
 * Emergency বা deployment এর সময় ব্যবহার করবে।
 */
export const clearAllCache = async (): Promise<void> => {
    if (!getRedisStatus()) return

    try {
        const client = getRedisClient()
        const keys = await client.keys('cache:*')
        
        if (keys.length > 0) {
            await client.del(keys)
            console.log(`[Cache] Cleared all ${keys.length} cached responses`)
        }
    } catch (err: any) {
        console.error('[Cache] Clear all failed:', err.message)
    }
}
