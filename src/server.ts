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
import scheduleAssociationCheck from './cron/associationCheck'
import morgan from 'morgan'
const PORT = process.env.PORT || 4000

export const app = express()

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
export const allowOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500']
app.use(cors({
    origin: allowOrigins,
    credentials: true
}))

// Apply rate limiting to API routes
app.use('/api/', apiLimiter, router)

const setCookies = (req: Request, res: Response, next: NextFunction) => {
    res.cookie("cookie", "hello world", {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
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

export let activeUsers: string[] = []

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    
    // Initialize cron jobs
    scheduleAssociationCheck();
    console.log('Association check cron job scheduled');
})