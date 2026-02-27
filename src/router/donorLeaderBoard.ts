import { Router } from "express";
import highestDonor from "../controller/donorLeaderboard/highestDonor";
import { cacheMiddleware } from "../handler/cache/cacheMiddleware";

const donorLeaderBoardRouter = Router()

// Leaderboard — 5 মিনিট cache
donorLeaderBoardRouter.get("/highest-donor", cacheMiddleware(300), highestDonor);

export default donorLeaderBoardRouter;

