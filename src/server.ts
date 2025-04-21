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
const PORT = process.env.PORT || 4000

export const app = express()

// Trust proxy - required for Railway deployment behind proxy
app.set('trust proxy', 1);

// Basic security with Helmet - helps with many security vulnerabilities including DDoS
app.use(helmet({
    crossOriginResourcePolicy: false
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
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

export let activeUsers: string[] = []

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    
    // Initialize cron jobs
    scheduleOrganizationCheck();
    console.log('Organization check cron job scheduled');
    scheduleDonationReminder();
    console.log('Donation reminder cron job scheduled');
})