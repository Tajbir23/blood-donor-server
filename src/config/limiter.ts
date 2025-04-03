import rateLimit from "express-rate-limit"

// Rate limiting for DDoS protection - all API routes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    skip: (req, res) => {
        return req.headers['x-forwarded-for'] === '127.0.0.1'
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
    skip: (req, res) => {
        return req.headers['x-forwarded-for'] === '127.0.0.1'
    },
    handler: (req, res) => {
        res.status(429).json({ error: 'Too many login attempts, please try again after an hour' })
    }
})

export const bloodRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 1 request per hour
    message: { error: 'আপনি ইতিমধ্যে একটি রক্তের অনুরোধ করেছেন। অনুগ্রহ করে ১ ঘন্টা পরে আবার চেষ্টা করুন।', success: false },
    standardHeaders: true,
    legacyHeaders: false,
})

