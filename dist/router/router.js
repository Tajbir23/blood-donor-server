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
const route_1 = __importDefault(require("./administrator/system/route"));
const orgAdminRoute_1 = __importDefault(require("./administrator/organizations/orgAdminRoute"));
const homeRouter_1 = __importDefault(require("./home/homeRouter"));
const blogRoute_1 = __importDefault(require("./blogRoute"));
const router = (0, express_1.Router)();
router.use('/user', userRouter_1.default);
router.use('/organization', organizationRoute_1.default);
router.use('/blood_request', bloodRequestRoute_1.default);
router.use('/payment', paymentRoute_1.default);
router.use('/donor-leaderboard', donorLeaderBoard_1.default);
router.use('/blog', blogRoute_1.default);
router.use('/home', homeRouter_1.default);
// system administrator routes
router.use('/system', route_1.default);
router.use('/org_admin', orgAdminRoute_1.default);
exports.default = router;
