"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationRoute_1 = __importDefault(require("./organizationRoute"));
const dashboardRoute_1 = __importDefault(require("./dashboardRoute"));
const systemAdminRoute = (0, express_1.Router)();
systemAdminRoute.use('/organizations', organizationRoute_1.default);
systemAdminRoute.use('/dashboard', dashboardRoute_1.default);
exports.default = systemAdminRoute;
