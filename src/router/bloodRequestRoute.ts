import { Router } from "express";
import requestForBlood from "../controller/blood/requestForBlood";
import { bloodRequestLimiter } from "../config/limiter";
import getBloodRequests from "../handler/donor/getBloodRequests";
import getDonors from "../handler/donor/getDonors";

const bloodRequestRoute = Router()

bloodRequestRoute.post("/request", bloodRequestLimiter, requestForBlood)
bloodRequestRoute.get("/requests", getBloodRequests)
bloodRequestRoute.get("/donors", getDonors)

export default bloodRequestRoute
