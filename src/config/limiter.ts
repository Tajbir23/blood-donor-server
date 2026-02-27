import rateLimit from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import { getRedisClient, getRedisStatus } from "./redis"

/**
 * Redis connected থাকলে RedisStore ব্যবহার করবে,
 * না থাকলে default MemoryStore এ fallback করবে।
 * এতে cluster mode এ সব instance এর rate limit shared হবে।
 */
const getStore = (prefix: string) => {
    if (!getRedisStatus()) return undefined // fallback to MemoryStore
    
    return new RedisStore({
        sendCommand: (...args: string[]) => (getRedisClient() as any).sendCommand(args),
        prefix: `rl:${prefix}:`,
    })
}

// Rate limiting for DDoS protection - all API routes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    store: getStore('api'),
    // Only skip rate limiting for local development
    skip: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress || '';
        return ip === '127.0.0.1' || ip === '::1' || ip.includes('::ffff:127.0.0.1');
    },
    handler: (req, res) => {
        res.status(429).json({
            message: 'Too many requests from this IP, please try again after 15 minutes'
        })
    }
})

// Apply stricter rate limiting to sensitive routes
export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 5 requests
    message: { error: 'Too many login attempts, please try again after an hour' },
    store: getStore('login'),
    // Only skip rate limiting for local development
    skip: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress || '';
        return ip === '127.0.0.1' || ip === '::1' || ip.includes('::ffff:127.0.0.1');
    },
    handler: (req, res) => {
        res.status(429).json({ error: 'Too many login attempts, please try again after an hour' })
    }
})

export const bloodRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per hour
    message: { error: 'আপনি ইতিমধ্যে একটি রক্তের অনুরোধ করেছেন। অনুগ্রহ করে ১ ঘন্টা পরে আবার চেষ্টা করুন।', success: false },
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore('blood'),
})

