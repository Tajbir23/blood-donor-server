"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../../../models/organization/organizationSchema"));
const handleRoleChange_1 = __importDefault(require("../../../../handler/administrator/organization/handleRoleChange"));
const manageRole = async (req, res) => {
    const { organizationId } = req.params;
    const { userId, targetRole } = req.body;
    const adminRole = req.role;
    const _id = req.user._id;
    try {
        // Check if user is trying to change their own role
        if (userId === _id) {
            // Only owner can change their own role
            if (adminRole !== "owner") {
                res.status(403).json({ success: false, message: "Only owner can change their own role" });
                return;
            }
        }
        const organization = await organizationSchema_1.default.findById(organizationId);
        if (!organization) {
            res.status(404).json({ success: false, message: "Organization not found" });
            return;
        }
        // OWNER — can change any role
        if (adminRole === "owner") {
            await (0, handleRoleChange_1.default)(organizationId, userId, targetRole, res, true);
            return;
        }
        // MODERATOR — cannot change roles
        if (adminRole === "moderator") {
            if (["member"].includes(targetRole)) {
                await (0, handleRoleChange_1.default)(organizationId, userId, targetRole, res);
                return;
            }
            res.status(403).json({ success: false, message: "Moderators cannot change any roles" });
            return;
        }
        // ADMIN — can change to moderator or member
        if (adminRole === "admin") {
            if (["moderator", "member"].includes(targetRole)) {
                await (0, handleRoleChange_1.default)(organizationId, userId, targetRole, res);
                return;
            }
            else {
                res.status(403).json({ success: false, message: `Admins can't assign role: ${targetRole}` });
                return;
            }
        }
        // SUPER ADMIN — can change to admin, moderator, member (not owner)
        if (adminRole === "superAdmin") {
            if (targetRole === "owner") {
                res.status(403).json({ success: false, message: "Super admin cannot assign 'owner' role" });
                return;
            }
            if (["admin", "moderator", "member"].includes(targetRole)) {
                await (0, handleRoleChange_1.default)(organizationId, userId, targetRole, res);
                return;
            }
            else {
                res.status(403).json({ success: false, message: `You don't have permission to assign role: ${targetRole}` });
                return;
            }
        }
        res.status(403).json({ success: false, message: "You don't have permission" });
        return;
    }
    catch (error) {
        console.error("Error managing role:", error);
        res.status(500).json({ success: false, message: "Error updating user role" });
    }
};
exports.default = manageRole;
