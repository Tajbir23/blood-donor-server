"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getOrganizations_1 = __importDefault(require("../../../controller/administrator/system/manageOrganizations/getOrganizations"));
const verifyJwt_1 = __importDefault(require("../../../handler/validation/verifyJwt"));
const manageOrg_1 = __importDefault(require("../../../controller/administrator/system/manageOrganizations/manageOrg"));
const organizationRoute = (0, express_1.Router)();
// admin and super admin can access this route
organizationRoute.get('/all_organizations', verifyJwt_1.default, getOrganizations_1.default);
organizationRoute.put('/update_organization_status/:organizationId', verifyJwt_1.default, manageOrg_1.default);
exports.default = organizationRoute;
