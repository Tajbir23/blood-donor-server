import { Router } from "express";
import organizationRoute from "./organizationRoute";

const systemAdminRoute = Router()

systemAdminRoute.use('/organizations', organizationRoute)

export default systemAdminRoute;
