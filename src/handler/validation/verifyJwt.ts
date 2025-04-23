import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const verifyJwt = (req: Request, res: Response, next: NextFunction): void => {
    
    try {
        const token =  req.headers.authorization?.split(' ')[1];
        console.log("verifyJwt.ts token", token)
        if (!token) {
            console.log("verifyJwt.ts", 401)
            res.status(401).json({success: false, message: 'অনুমতি নেই' });
            return;
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded
        next();
    } catch (error) {
        console.log(error)
        console.log("verifyJwt.ts error", 401)
        res.status(401).json({success: false, message: 'অবৈধ টোকেন' });
    }
}

export default verifyJwt
