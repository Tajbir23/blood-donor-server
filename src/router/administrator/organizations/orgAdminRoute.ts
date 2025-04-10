import { Router } from "express";
import getPendingMembers from "../../../controller/administrator/organizations/manageOrganizations/getPendingMembers";
import verifyJwt from "../../../handler/validation/verifyJwt";
import verifyOrganizationAdmin from "../../../handler/validation/verifyOrganizationAdmin";
import manageOrgJoinReq from "../../../controller/administrator/organizations/manageOrganizations/manageOrgJoinReq";
import addMember from "../../../controller/administrator/organizations/manageOrganizations/addMember";
import updateUserLastDonation from "../../../controller/administrator/organizations/user/UpdateUserLastDonation";
import manageRole from "../../../controller/administrator/organizations/manageOrganizations/manageRole";
import removeUser from "../../../controller/administrator/organizations/manageOrganizations/removeUser";

const orgAdminRouter = Router()

orgAdminRouter.get('/pending_members/:organizationId',verifyJwt, verifyOrganizationAdmin, getPendingMembers)
orgAdminRouter.post('/manage_members/:organizationId',verifyJwt, verifyOrganizationAdmin, manageOrgJoinReq)
orgAdminRouter.post('/add_member/:organizationId',verifyJwt, verifyOrganizationAdmin, addMember)
orgAdminRouter.put('/update_last_donation/:organizationId',verifyJwt, verifyOrganizationAdmin, updateUserLastDonation)
orgAdminRouter.post('/manage_role/:organizationId', verifyJwt, verifyOrganizationAdmin, manageRole)
orgAdminRouter.post('/remove_member/:organizationId', verifyJwt, verifyOrganizationAdmin, removeUser)

export default orgAdminRouter;
