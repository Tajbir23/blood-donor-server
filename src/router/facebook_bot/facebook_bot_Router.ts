import { Router } from "express";
import verifyWebHook from "../../controller/chatBot/verifyWebHook";
import chatBot from "../../controller/chatBot/chatBot";

const FacebookBotRouter = Router();

FacebookBotRouter.get('/', verifyWebHook);
FacebookBotRouter.post('/', chatBot)
export default FacebookBotRouter;