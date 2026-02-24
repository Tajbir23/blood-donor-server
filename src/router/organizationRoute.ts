import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload, organizationLogoUpload } from "../handler/fileUpload/imageUpload";
import myOrganizations from "../controller/organization/myOrganizations";
import allOrganizations from "../controller/organization/allOrganizations";
import orgJoinRequest from "../controller/organization/orgJoinRequest";
import getMembers from "../controller/organization/getMembers";
import getDonations from "../controller/organization/getDonations";
import getOrganizationById from "../controller/organization/getOrganizationById";
import getPublicOrganizationById from "../controller/organization/getPublicOrganizationById";
import getOrgDashboardStats from "../controller/organization/getOrgDashboardStats";
import updateOrganization from "../controller/organization/updateOrganization";

const organizationRouter = Router();

organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)
organizationRouter.get('/my_organizations', verifyJwt, myOrganizations)
organizationRouter.get('/organizations', allOrganizations)
organizationRouter.get('/public/:organizationId', getPublicOrganizationById)
organizationRouter.get('/details/:organizationId', verifyJwt, getOrganizationById)
organizationRouter.post('/join_request/:organizationId', verifyJwt, orgJoinRequest)
organizationRouter.get('/members/:organizationId', getMembers)
organizationRouter.get('/donations/:organizationId', verifyJwt, getDonations)
organizationRouter.get('/dashboard/:organizationId', verifyJwt, getOrgDashboardStats)
organizationRouter.put('/update/:organizationId', verifyJwt, updateOrganization)

export default organizationRouter;

