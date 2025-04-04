"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registerOrg_1 = __importDefault(require("../controller/organization/registerOrg"));
const verifyJwt_1 = __importDefault(require("../handler/validation/verifyJwt"));
const imageUpload_1 = require("../handler/fileUpload/imageUpload");
const myOrganizations_1 = __importDefault(require("../controller/organization/myOrganizations"));
const allOrganizations_1 = __importDefault(require("../controller/organization/allOrganizations"));
const orgJoinRequest_1 = __importDefault(require("../controller/organization/orgJoinRequest"));
const manageOrgJoinReq_1 = __importDefault(require("../controller/organization/manageOrgJoinReq"));
const verifyOrganizationAdmin_1 = __importDefault(require("../handler/validation/verifyOrganizationAdmin"));
const organizationRouter = (0, express_1.Router)();
const organizationLogoUpload = (0, imageUpload_1.createImageUpload)('organization');
organizationRouter.post('/register', verifyJwt_1.default, organizationLogoUpload, registerOrg_1.default);
organizationRouter.get('/my_organizations', verifyJwt_1.default, myOrganizations_1.default);
organizationRouter.get('/organizations', allOrganizations_1.default);
organizationRouter.post('/join_request/:organizationId', verifyJwt_1.default, orgJoinRequest_1.default);
// Add routes for organization management, such as updating organization details, deleting organization, etc.
organizationRouter.post('/administrator/manage_join_request/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, manageOrgJoinReq_1.default);
exports.default = organizationRouter;
