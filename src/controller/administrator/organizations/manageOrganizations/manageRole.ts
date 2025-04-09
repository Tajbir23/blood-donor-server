import { Request, Response } from "express";
import organizationModel from "../../../../models/organization/organizationSchema";
import handleRoleChange from "../../../../handler/administrator/organization/handleRoleChange";

const manageRole = async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const {userId, targetRole} = req.body
    const adminRole = (req as any).user.role;
    const _id = (req as any).user._id;

    try {
        // Check if user is trying to change their own role
        if (userId === _id) {
            // Only owner can change their own role
            if (adminRole !== "owner") {
                res.status(403).json({ success: false, message: "Only owner can change their own role" });
                return
            }
        }

        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            res.status(404).json({ success: false, message: "Organization not found" });
            return
        }

        // OWNER — can change any role
        if (adminRole === "owner") {
            await handleRoleChange(organizationId, userId, targetRole, res, true);
            return
        }

        // MODERATOR — cannot change roles
        if (adminRole === "moderator") {
            res.status(403).json({ success: false, message: "Moderators cannot change any roles" });
            return
        }

        // ADMIN — can change to moderator or member
        if (adminRole === "admin") {
            if (["moderator", "member"].includes(targetRole)) {
                await handleRoleChange(organizationId, userId, targetRole, res);
                return
            } else {
                res.status(403).json({ success: false, message: `Admins can't assign role: ${targetRole}` });
                return
            }
        }

        // SUPER ADMIN — can change to admin, moderator, member (not owner)
        if (adminRole === "superAdmin") {
            if (targetRole === "owner") {
                res.status(403).json({ success: false, message: "Super admin cannot assign 'owner' role" });
                return
            }
            if (["admin", "moderator", "member"].includes(targetRole)) {
                await handleRoleChange(organizationId, userId, targetRole, res);
                return
            } else {
                res.status(403).json({ success: false, message: `Invalid role ${targetRole}` });
                return
            }
        }

        res.status(403).json({ success: false, message: "You don't have permission" });
        return

    } catch (error) {
        console.error("Error managing role:", error);
        res.status(500).json({ success: false, message: "Error updating user role" });
    }
};

export default manageRole;
