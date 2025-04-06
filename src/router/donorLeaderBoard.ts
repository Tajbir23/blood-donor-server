import { Router } from "express";
import highestDonor from "../controller/donorLeaderboard/highestDonor";

const donorLeaderBoardRouter = Router()

donorLeaderBoardRouter.get("/highest-donor", highestDonor);

export default donorLeaderBoardRouter;

