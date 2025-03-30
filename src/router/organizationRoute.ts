import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload } from "../handler/fileUpload/imageUpload";
import myOrganizations from "../controller/organization/myOrganizations";

const organizationRouter = Router();

const organizationLogoUpload = createImageUpload('organization')
organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)
organizationRouter.get('/my_organizations', verifyJwt, myOrganizations)
export default organizationRouter;

