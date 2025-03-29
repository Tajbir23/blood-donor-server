import { Router } from "express";
import registerOrg from "../controller/organization/registerOrg";
import verifyJwt from "../handler/validation/verifyJwt";
import imageUpload from "../handler/fileUpload/imageUpload";

const organizationRouter = Router();

organizationRouter.post('/register', verifyJwt, imageUpload, registerOrg)

export default organizationRouter;

