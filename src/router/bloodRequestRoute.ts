import { Router } from "express";
import requestForBlood from "../controller/blood/requestForBlood";
import { bloodRequestLimiter } from "../config/limiter";

const bloodRequestRoute = Router()

bloodRequestRoute.post("/request", bloodRequestLimiter, requestForBlood)

export default bloodRequestRoute
