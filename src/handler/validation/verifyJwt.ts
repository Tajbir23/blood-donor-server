import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const verifyJwt = (req: Request, res: Response, next: NextFunction): void => {
    
    try {
        const token =  req.headers.authorization?.split(' ')[1];
        console.log( req.headers.authorization?.split(' ')[1])
        if (!token) {
            res.status(401).json({ message: 'অনুমতি নেই' });
            return;
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'অবৈধ টোকেন' });
    }
}

export default verifyJwt
