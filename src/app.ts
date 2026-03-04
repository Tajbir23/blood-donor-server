import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'

export const app = express()

export const allowOrigins = [
    'http://localhost:3000', 
    'http://127.0.0.1:5500', 
    'https://0037-103-248-204-82.ngrok-free.app', 
    'https://blood-donor-bangladesh.vercel.app',
    'https://blood-donor-client.vercel.app'
]
