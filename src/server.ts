import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import connection from './config/db'
import { apiLimiter } from './config/limiter'
import router from './router/router'
import detectVpn from './handler/validation/detectVpn'
import scheduleOrganizationCheck from './cron/organizationCheck'
import scheduleDonationReminder from './cron/donationReminder'
import morgan from 'morgan'
import path from 'path'
import FacebookBotRouter from './router/facebook_bot/facebook_bot_Router'
import TelegramBotRouter from './router/telegram_bot/telegram_bot_Router'
import { setTelegramWebhook } from './handler/telegramBotHandler/sendMessageToTgUser'
import setupGetStartedButton from './handler/facebookBotHandler/setUpGetStartedButton'
import setupPersistentMenu from './handler/facebookBotHandler/setUpPersistantMenu'
import { verifyEmailConfig } from './controller/email/sendEmail'
import { trainIntentModel } from './handler/facebookBotHandler/ai/intentClassifier'
const PORT = process.env.PORT || 4000

export const app = express()

// Trust proxy - required for Railway deployment behind proxy
app.set('trust proxy', 1);

// Basic security with Helmet - helps with many security vulnerabilities including DDoS
// Disable CSP as we'll use our custom implementation for more control
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false // We'll use our custom CSP middleware instead
}))

// Set up custom morgan format to show cookies
app.use(morgan(':method :url :status :res[set-cookie] - :response-time ms'))

// Request size limiting to prevent request flooding
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Connect to MongoDB
connection()

// CORS setup - must be before routes
export const allowOrigins = [
    'http://localhost:3000', 
    'http://127.0.0.1:5500', 
    'https://0037-103-248-204-82.ngrok-free.app', 
    'https://blood-donor-bangladesh.vercel.app',
    'https://blood-donor-client.vercel.app'
]

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        if(allowOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}))

// Set up static file serving for uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Default CSP header for routes that don't need inline scripts
app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip if it's a route that will set its own CSP
    if (req.path.startsWith('/api/payment/invoice/')) {
        return next();
    }
    
    // Default strict CSP for API routes
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self'; " +
        "img-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self';"
    );
    next();
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter, router)

const setCookies = (req: Request, res: Response, next: NextFunction) => {
    res.cookie("cookie", "hello world", {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })
    next()
}

// Test route
app.get('/', setCookies, async(req: Request, res: Response) => {
    res.send({message: "hello rangpur"})
})

app.get('/test-cookie', (req: Request, res: Response) => {
    res.cookie("testCookie", "works", {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    })
    res.send({ message: "Cookie set!" })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

app.use('/webhook', FacebookBotRouter)
app.use('/telegram-webhook', TelegramBotRouter)
export let activeUsers: string[] = []

app.listen(PORT, async() => {
    console.log(`Server is running on http://localhost:${PORT}`)
    
    // Verify email (SMTP) credentials on startup
    await verifyEmailConfig();

    // Initialize cron jobs
    scheduleOrganizationCheck();
    console.log('Organization check cron job scheduled');
    scheduleDonationReminder();
    console.log('Donation reminder cron job scheduled');
    await setupGetStartedButton();
    await setupPersistentMenu();

    // Train the Facebook Bot AI intent classifier in the background
    // (runs fully locally with TensorFlow.js – no API key needed)
    trainIntentModel()
        .then(() => console.log('[AI] Bot intent model ready ✓'))
        .catch(err => console.error('[AI] Model training failed:', err));

    // Register Telegram webhook
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && process.env.TELEGRAM_BOT_TOKEN) {
        setTelegramWebhook(`${backendUrl}/telegram-webhook`)
            .then(() => console.log('[TG] Webhook registered ✓'))
            .catch(err => console.error('[TG] Webhook registration failed:', err));
    } else {
        console.warn('[TG] BACKEND_URL or TELEGRAM_BOT_TOKEN missing – webhook not set');
    }
})