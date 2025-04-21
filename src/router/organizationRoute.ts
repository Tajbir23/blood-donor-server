import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload } from "../handler/fileUpload/imageUpload";
import myOrganizations from "../controller/organization/myOrganizations";
import allOrganizations from "../controller/organization/allOrganizations";
import orgJoinRequest from "../controller/organization/orgJoinRequest";

import manageOrgJoinReq from "../controller/administrator/organizations/manageOrganizations/manageOrgJoinReq";
import verifyOrganizationAdmin from "../handler/validation/verifyOrganizationAdmin";
import getMembers from "../controller/organization/getMembers";

const organizationRouter = Router();

// Create optimized organization logo upload with appropriate settings
const organizationLogoUpload = createImageUpload('organization', {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp' // Using WebP for better compression while maintaining quality
});

organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)
organizationRouter.get('/my_organizations', verifyJwt, myOrganizations)
organizationRouter.get('/organizations', allOrganizations)
organizationRouter.post('/join_request/:organizationId', verifyJwt, orgJoinRequest)
organizationRouter.get('/members/:organizationId', getMembers)

export default organizationRouter;

