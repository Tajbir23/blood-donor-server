import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import { createImageUpload } from "../handler/fileUpload/imageUpload";

const organizationRouter = Router();

const organizationLogoUpload = createImageUpload('organization')
organizationRouter.post('/register', verifyJwt, organizationLogoUpload, registerOrg)

export default organizationRouter;

