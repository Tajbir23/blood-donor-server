import { Router } from "express";
import telegramChatBot from "../../controller/chatBot/telegramChatBot";

const TelegramBotRouter = Router();

TelegramBotRouter.post("/", telegramChatBot);

export default TelegramBotRouter;
