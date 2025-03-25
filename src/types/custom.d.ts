import 'express';

declare module 'express' {
  interface Request {
    currentIp?: string | string[];
  }
} 