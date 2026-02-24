import { NextFunction, Request, Response } from "express";

const verifyIsSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    const { role } = (req as any).user;
    if (role !== "superAdmin") {
        res.status(403).json({
            success: false,
            message: "এই resource শুধুমাত্র superAdmin এর জন্য",
        });
        return;
    }
    next();
};

export default verifyIsSuperAdmin;
