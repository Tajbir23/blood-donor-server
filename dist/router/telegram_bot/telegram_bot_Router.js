"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegramChatBot_1 = __importDefault(require("../../controller/chatBot/telegramChatBot"));
const TelegramBotRouter = (0, express_1.Router)();
TelegramBotRouter.post("/", telegramChatBot_1.default);
exports.default = TelegramBotRouter;
