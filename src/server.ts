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
import setupGetStartedButton from './handler/facebookBotHandler/setUpGetStartedButton'
import setupPersistentMenu from './handler/facebookBotHandler/setUpPersistantMenu'
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
export let activeUsers: string[] = []

app.listen(PORT, async() => {
    console.log(`Server is running on http://localhost:${PORT}`)
    
    // Initialize cron jobs
    scheduleOrganizationCheck();
    console.log('Organization check cron job scheduled');
    scheduleDonationReminder();
    console.log('Donation reminder cron job scheduled');
    await setupGetStartedButton();
    console.log('Get Started button set successfully');
    await setupPersistentMenu();
    console.log('Persistent menu set successfully');
})