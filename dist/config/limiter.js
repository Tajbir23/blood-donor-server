"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bloodRequestLimiter = exports.loginLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("./redis");
/**
 * Redis connected থাকলে RedisStore ব্যবহার করবে,
 * না থাকলে default MemoryStore এ fallback করবে।
 * এতে cluster mode এ সব instance এর rate limit shared হবে।
 */
const getStore = (prefix) => {
    if (!(0, redis_1.getRedisStatus)())
        return undefined; // fallback to MemoryStore
    return new rate_limit_redis_1.RedisStore({
        sendCommand: (...args) => (0, redis_1.getRedisClient)().sendCommand(args),
        prefix: `rl:${prefix}:`,
    });
};
// Rate limiting for DDoS protection - all API routes
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
        });
    }
});
// Apply stricter rate limiting to sensitive routes
exports.loginLimiter = (0, express_rate_limit_1.default)({
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
        res.status(429).json({ error: 'Too many login attempts, please try again after an hour' });
    }
});
exports.bloodRequestLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per hour
    message: { error: 'আপনি ইতিমধ্যে একটি রক্তের অনুরোধ করেছেন। অনুগ্রহ করে ১ ঘন্টা পরে আবার চেষ্টা করুন।', success: false },
    standardHeaders: true,
    legacyHeaders: false,
    store: getStore('blood'),
});
