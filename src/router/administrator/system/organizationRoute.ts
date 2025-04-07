import { Router } from "express";
import getOrganizations from "../../../controller/administrator/system/manageOrganizations/getOrganizations";
import verifyJwt from "../../../handler/validation/verifyJwt";
import manageOrg from "../../../controller/administrator/system/manageOrganizations/manageOrg";

const organizationRoute = Router()

// admin and super admin can access this route
organizationRoute.get('/all_organizations',verifyJwt, getOrganizations)
organizationRoute.put('/update_organization_status/:organizationId',verifyJwt, manageOrg)
export default organizationRoute;
