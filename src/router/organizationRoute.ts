import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload, organizationLogoUpload } from "../handler/fileUpload/imageUpload";
import myOrganizations from "../controller/organization/myOrganizations";
import allOrganizations from "../controller/organization/allOrganizations";
import orgJoinRequest from "../controller/organization/orgJoinRequest";
import getMembers from "../controller/organization/getMembers";

const organizationRouter = Router();



organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)
organizationRouter.get('/my_organizations', verifyJwt, myOrganizations)
organizationRouter.get('/organizations', allOrganizations)
organizationRouter.post('/join_request/:organizationId', verifyJwt, orgJoinRequest)
organizationRouter.get('/members/:organizationId', getMembers)

export default organizationRouter;

