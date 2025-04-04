"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestForBlood_1 = __importDefault(require("../controller/blood/requestForBlood"));
const limiter_1 = require("../config/limiter");
const bloodRequestRoute = (0, express_1.Router)();
bloodRequestRoute.post("/request", limiter_1.bloodRequestLimiter, requestForBlood_1.default);
exports.default = bloodRequestRoute;
