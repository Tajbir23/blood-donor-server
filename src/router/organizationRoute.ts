import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload } from "../handler/fileUpload/imageUpload";
import myOrganizations from "../controller/organization/myOrganizations";
import allOrganizations from "../controller/organization/allOrganizations";
import orgJoinRequest from "../controller/organization/orgJoinRequest";

import manageOrgJoinReq from "../controller/organization/manageOrgJoinReq";
import verifyOrganizationAdmin from "../handler/validation/verifyOrganizationAdmin";

const organizationRouter = Router();

const organizationLogoUpload = createImageUpload('organization')
organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)
organizationRouter.get('/my_organizations', verifyJwt, myOrganizations)
organizationRouter.get('/organizations', allOrganizations)
organizationRouter.post('/join_request', verifyJwt, orgJoinRequest)

// Add routes for organization management, such as updating organization details, deleting organization, etc.
organizationRouter.post('/administrator/manage_join_request/:organizationId', verifyJwt, verifyOrganizationAdmin, manageOrgJoinReq)
export default organizationRouter;

