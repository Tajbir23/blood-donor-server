import { JwtPayload } from 'jsonwebtoken';
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: object;
            filePath?: string;
            currentIp?: string | string[];
        }
    }
} 