"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyWebHook_1 = __importDefault(require("../../controller/chatBot/verifyWebHook"));
const chatBot_1 = __importDefault(require("../../controller/chatBot/chatBot"));
const FacebookBotRouter = (0, express_1.Router)();
FacebookBotRouter.get('/', verifyWebHook_1.default);
FacebookBotRouter.post('/', chatBot_1.default);
exports.default = FacebookBotRouter;
