"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter_1 = __importDefault(require("./userRouter"));
const organizationRoute_1 = __importDefault(require("./organizationRoute"));
const bloodRequestRoute_1 = __importDefault(require("./bloodRequestRoute"));
const paymentRoute_1 = __importDefault(require("./paymentRoute"));
const donorLeaderBoard_1 = __importDefault(require("./donorLeaderBoard"));
const router = (0, express_1.Router)();
router.use('/user', userRouter_1.default);
router.use('/organization', organizationRoute_1.default);
router.use('/blood_request', bloodRequestRoute_1.default);
router.use('/payment', paymentRoute_1.default);
router.use('/donor-leaderboard', donorLeaderBoard_1.default);
exports.default = router;
