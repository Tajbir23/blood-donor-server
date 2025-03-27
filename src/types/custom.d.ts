import 'express';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    currentIp?: string | string[];
    user?: JwtPayload;
  }
} 