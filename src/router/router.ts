import { NextFunction, Request, Response, Router } from "express";
import userRouter from "./userRouter";
import organizationRouter from "./organizationRoute";

const router = Router()


router.use('/user', userRouter)
router.use('/organization', organizationRouter)
export default router;