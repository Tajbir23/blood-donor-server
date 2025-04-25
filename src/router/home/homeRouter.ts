import { Router } from "express";
import getActiveBanner from "../../controller/home/getActiveBanner";

const homeRouter = Router();

homeRouter.get('/slider', getActiveBanner)

export default homeRouter