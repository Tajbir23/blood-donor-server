import { Router } from "express";
import organizationRoute from "./organizationRoute";
import systemDashboardRoute from "./dashboardRoute";

const systemAdminRoute = Router()

systemAdminRoute.use('/organizations', organizationRoute)
systemAdminRoute.use('/dashboard', systemDashboardRoute)
export default systemAdminRoute;
