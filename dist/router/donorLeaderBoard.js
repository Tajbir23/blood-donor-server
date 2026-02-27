"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const highestDonor_1 = __importDefault(require("../controller/donorLeaderboard/highestDonor"));
const cacheMiddleware_1 = require("../handler/cache/cacheMiddleware");
const donorLeaderBoardRouter = (0, express_1.Router)();
// Leaderboard — 5 মিনিট cache
donorLeaderBoardRouter.get("/highest-donor", (0, cacheMiddleware_1.cacheMiddleware)(300), highestDonor_1.default);
exports.default = donorLeaderBoardRouter;
