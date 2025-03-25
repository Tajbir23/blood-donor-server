import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import connection from './config/db'
import { apiLimiter, loginLimiter } from './config/limiter'
import router from './router/router'
import detectVpn from './handler/validation/detectVpn'
import scheduleAssociationCheck from './cron/associationCheck'
const PORT = process.env.PORT || 4000

export const app = express()

// Basic security with Helmet - helps with many security vulnerabilities including DDoS
app.use(helmet())

// Request size limiting to prevent request flooding
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Connect to MongoDB
connection()


// Apply rate limiting to API routes
app.use('/api/',apiLimiter, router)


export const allowOrigins = ['http://localhost:3000']
app.use(cors({
    origin: allowOrigins,
    credentials: true
}))

app.get('/',detectVpn, async(req: Request, res: Response) => {
    res.send({message: "hello rangpur"})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
    
    // Initialize cron jobs
    scheduleAssociationCheck();
    console.log('Association check cron job scheduled');
})