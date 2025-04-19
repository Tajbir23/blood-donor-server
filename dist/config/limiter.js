"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bloodRequestLimiter = exports.loginLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting for DDoS protection - all API routes
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
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
    max: 100, // Limit each IP to 1 request per hour
    message: { error: 'আপনি ইতিমধ্যে একটি রক্তের অনুরোধ করেছেন। অনুগ্রহ করে ১ ঘন্টা পরে আবার চেষ্টা করুন।', success: false },
    standardHeaders: true,
    legacyHeaders: false
});
