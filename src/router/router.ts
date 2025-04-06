import { Router } from "express";
import userRouter from "./userRouter";
import organizationRouter from "./organizationRoute";
import bloodRequestRoute from "./bloodRequestRoute";
import paymentRouter from "./paymentRoute";
import donorLeaderBoardRouter from "./donorLeaderBoard";

const router = Router()


router.use('/user', userRouter)
router.use('/organization', organizationRouter)
router.use('/blood_request', bloodRequestRoute)
router.use('/payment', paymentRouter)
router.use('/donor-leaderboard', donorLeaderBoardRouter)

export default router;