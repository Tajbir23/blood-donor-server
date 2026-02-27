import { createClient, RedisClientType } from 'redis'

// ─── Redis Client Singleton ─────────────────────────────────────────────────
// Graceful fallback: যদি Redis unavailable থাকে, server চলবে কিন্তু
// caching / rate-limit shared store কাজ করবে না।

let redisClient: RedisClientType
let isRedisConnected = false

/**
 * Redis client তৈরি ও connect করে। server.ts থেকে একবারই call হবে।
 * Redis URL না দিলে localhost:6379 তে connect করবে।
 */
export const connectRedis = async (): Promise<void> => {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                // Production-ready reconnect strategy
                reconnectStrategy: (retries: number) => {
                    if (retries > 10) {
                        console.error('[Redis] Max reconnect attempts reached. Giving up.');
                        return new Error('Redis max retries reached');
                    }
                    // Exponential backoff: 200ms, 400ms, 800ms ... max 5s
                    return Math.min(retries * 200, 5000);
                },
                connectTimeout: 10000, // 10s timeout
            },
        })

        // ─── Event Listeners ────────────────────────────────────────────
        redisClient.on('connect', () => {
            console.log('[Redis] Connecting...');
        })

        redisClient.on('ready', () => {
            isRedisConnected = true;
            console.log('[Redis] Connected & ready ✓');
        })

        redisClient.on('error', (err) => {
            isRedisConnected = false;
            console.error('[Redis] Error:', err.message);
        })

        redisClient.on('end', () => {
            isRedisConnected = false;
            console.log('[Redis] Connection closed');
        })

        await redisClient.connect();
    } catch (err: any) {
        isRedisConnected = false;
        console.error('[Redis] Initial connection failed:', err.message);
        console.warn('[Redis] Server will continue without Redis – in-memory fallback active');
    }
}

/**
 * Redis connected কিনা check করে  
 */
export const getRedisStatus = (): boolean => isRedisConnected;

/**
 * Redis client instance return করে  
 * ⚠️ connectRedis() call এর পরেই ব্যবহার করবে
 */
export const getRedisClient = (): RedisClientType => redisClient;

/**
 * Graceful shutdown এর জন্য — process exit এ call করবে
 */
export const disconnectRedis = async (): Promise<void> => {
    if (redisClient && isRedisConnected) {
        await redisClient.quit();
        console.log('[Redis] Disconnected gracefully');
    }
}
