"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getActiveBanner_1 = __importDefault(require("../../controller/home/getActiveBanner"));
const cacheMiddleware_1 = require("../../handler/cache/cacheMiddleware");
const homeRouter = (0, express_1.Router)();
// Home slider — 10 মিনিট cache (এটা frequently change হয় না)
homeRouter.get('/slider', (0, cacheMiddleware_1.cacheMiddleware)(600), getActiveBanner_1.default);
exports.default = homeRouter;
