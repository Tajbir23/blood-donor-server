import { NextFunction, Request, Response } from "express";

const verifyIsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const {role} = (req as any).user;

    console.log(role)
    if(role !== 'admin' && role !== 'superAdmin' && role !== 'moderator'){
        res.status(403).json({
            success: false,
            message: "You are not authorized to access this resource"
        })
        return;
    }

    next();
}

export default verifyIsAdmin;
