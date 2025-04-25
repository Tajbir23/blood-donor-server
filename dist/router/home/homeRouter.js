"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getActiveBanner_1 = __importDefault(require("../../controller/home/getActiveBanner"));
const homeRouter = (0, express_1.Router)();
homeRouter.get('/slider', getActiveBanner_1.default);
exports.default = homeRouter;
