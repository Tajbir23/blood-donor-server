import { Router } from "express";
import getDashboardData from "../../../controller/administrator/system/dashboard/getDashboardData";
import verifyJwt from "../../../handler/validation/verifyJwt";
import verifyIsAdmin from "../../../handler/validation/verifyIsAdmin";
import getAllUsers from "../../../controller/administrator/system/dashboard/getAllUsers";
import roleChangeUser from "../../../controller/administrator/system/dashboard/roleChangeUser";
import getAllAdmins from "../../../controller/administrator/system/dashboard/getAllAdmins";

const systemDashboardRoute = Router();

systemDashboardRoute.get('/dashboard', verifyJwt, verifyIsAdmin,  getDashboardData);
systemDashboardRoute.get('/users', verifyJwt, verifyIsAdmin, getAllUsers);
systemDashboardRoute.post('/role-change-user', verifyJwt, verifyIsAdmin, roleChangeUser);
systemDashboardRoute.get('/admins', verifyJwt, verifyIsAdmin, getAllAdmins);

export default systemDashboardRoute;
