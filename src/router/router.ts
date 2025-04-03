import { Router } from "express";
import userRouter from "./userRouter";
import organizationRouter from "./organizationRoute";
import bloodRequestRoute from "./bloodRequestRoute";

const router = Router()


router.use('/user', userRouter)
router.use('/organization', organizationRouter)
router.use('/blood_request', bloodRequestRoute)
export default router;