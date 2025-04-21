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
const getMembers_1 = __importDefault(require("../controller/organization/getMembers"));
const organizationRouter = (0, express_1.Router)();
// Create optimized organization logo upload with appropriate settings
const organizationLogoUpload = (0, imageUpload_1.createImageUpload)('organization', {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp' // Using WebP for better compression while maintaining quality
});
organizationRouter.post('/register', verifyJwt_1.default, organizationLogoUpload, registerOrg_1.default);
organizationRouter.get('/my_organizations', verifyJwt_1.default, myOrganizations_1.default);
organizationRouter.get('/organizations', allOrganizations_1.default);
organizationRouter.post('/join_request/:organizationId', verifyJwt_1.default, orgJoinRequest_1.default);
organizationRouter.get('/members/:organizationId', getMembers_1.default);
exports.default = organizationRouter;
