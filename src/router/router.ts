import { Router } from "express";
import userRouter from "./userRouter";
import organizationRouter from "./organizationRoute";
import bloodRequestRoute from "./bloodRequestRoute";
import paymentRouter from "./paymentRoute";
import donorLeaderBoardRouter from "./donorLeaderBoard";
import systemAdminRoute from "./administrator/system/route";
import orgAdminRouter from "./administrator/organizations/orgAdminRoute";


const router = Router()


router.use('/user', userRouter)
router.use('/organization', organizationRouter)
router.use('/blood_request', bloodRequestRoute)
router.use('/payment', paymentRouter)
router.use('/donor-leaderboard', donorLeaderBoardRouter)

// system administrator routes
router.use('/system', systemAdminRoute)
router.use('/org_admin', orgAdminRouter)
export default router;