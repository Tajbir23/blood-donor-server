import { Router } from "express";
import getActiveBanner from "../../controller/home/getActiveBanner";
import { cacheMiddleware } from "../../handler/cache/cacheMiddleware";

const homeRouter = Router();

// Home slider — 10 মিনিট cache (এটা frequently change হয় না)
homeRouter.get('/slider', cacheMiddleware(600), getActiveBanner)

export default homeRouter