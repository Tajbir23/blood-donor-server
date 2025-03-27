import { NextFunction, Request, Response, Router } from "express";
import userRouter from "./userRouter";

const router = Router()


router.use('/user', userRouter)

export default router;