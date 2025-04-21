"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getDashboardData_1 = __importDefault(require("../../../controller/administrator/system/dashboard/getDashboardData"));
const systemDashboardRoute = (0, express_1.Router)();
systemDashboardRoute.get('/dashboard', getDashboardData_1.default);
exports.default = systemDashboardRoute;
