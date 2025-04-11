"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getPendingMembers_1 = __importDefault(require("../../../controller/administrator/organizations/manageOrganizations/getPendingMembers"));
const verifyJwt_1 = __importDefault(require("../../../handler/validation/verifyJwt"));
const verifyOrganizationAdmin_1 = __importDefault(require("../../../handler/validation/verifyOrganizationAdmin"));
const manageOrgJoinReq_1 = __importDefault(require("../../../controller/administrator/organizations/manageOrganizations/manageOrgJoinReq"));
const addMember_1 = __importDefault(require("../../../controller/administrator/organizations/manageOrganizations/addMember"));
const UpdateUserLastDonation_1 = __importDefault(require("../../../controller/administrator/organizations/user/UpdateUserLastDonation"));
const manageRole_1 = __importDefault(require("../../../controller/administrator/organizations/manageOrganizations/manageRole"));
const removeUser_1 = __importDefault(require("../../../controller/administrator/organizations/manageOrganizations/removeUser"));
const orgAdminRouter = (0, express_1.Router)();
orgAdminRouter.get('/pending_members/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, getPendingMembers_1.default);
orgAdminRouter.post('/manage_members/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, manageOrgJoinReq_1.default);
orgAdminRouter.post('/add_member/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, addMember_1.default);
orgAdminRouter.put('/update_last_donation/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, UpdateUserLastDonation_1.default);
orgAdminRouter.post('/manage_role/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, manageRole_1.default);
orgAdminRouter.post('/remove_member/:organizationId', verifyJwt_1.default, verifyOrganizationAdmin_1.default, removeUser_1.default);
exports.default = orgAdminRouter;
