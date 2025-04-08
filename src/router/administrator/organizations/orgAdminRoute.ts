import { Router } from "express";
import getPendingMembers from "../../../controller/administrator/organizations/manageOrganizations/getPendingMembers";
import verifyJwt from "../../../handler/validation/verifyJwt";
import verifyOrganizationAdmin from "../../../handler/validation/verifyOrganizationAdmin";
import manageOrgJoinReq from "../../../controller/administrator/organizations/manageOrganizations/manageOrgJoinReq";

const orgAdminRouter = Router()

orgAdminRouter.get('/pending_members/:organizationId',verifyJwt, verifyOrganizationAdmin, getPendingMembers)
orgAdminRouter.post('/manage_members/:organizationId',verifyJwt, verifyOrganizationAdmin, manageOrgJoinReq)

export default orgAdminRouter;
