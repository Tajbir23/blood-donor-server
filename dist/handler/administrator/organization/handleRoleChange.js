"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const organizationSchema_1 = __importDefault(require("../../../models/organization/organizationSchema"));
const userSchema_1 = __importDefault(require("../../../models/user/userSchema"));
// ✅ Helper Function — Updated for Single Owner Support
const handleRoleChange = async (organizationId, userId, targetRole, res, isOwner = false) => {
    try {
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const orgObjectId = new mongoose_1.Types.ObjectId(organizationId);
        // Fetch the current organization data to check the existing owner
        const organization = await organizationSchema_1.default.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        // If user is changing to "owner"
        if (targetRole === "owner") {
            // Check if the requesting user is the current owner
            if (organization.owner.toString() === userId) {
                return res.status(400).json({ success: false, message: "This user is already the owner" });
            }
            // Remove the current owner role if any
            await organizationSchema_1.default.findByIdAndUpdate(organizationId, {
                $unset: { ownerId: "" }
            });
            // Set new owner
            await organizationSchema_1.default.findByIdAndUpdate(organizationId, {
                $set: { ownerId: userObjectId }
            });
            const user = await userSchema_1.default.findById(userId);
            res.status(200).json({
                success: true,
                message: `${user === null || user === void 0 ? void 0 : user.fullName} is now the owner of the organization`
            });
            return;
        }
        // Remove from all roles (admin and moderator)
        await organizationSchema_1.default.findByIdAndUpdate(organizationId, {
            $pull: {
                admins: userObjectId,
                moderators: userObjectId
            }
        });
        // if targetRole is member, add the organizationId to the user and remove from other roles
        if (targetRole === "member") {
            await userSchema_1.default.findByIdAndUpdate(userId, {
                $addToSet: { organizations: orgObjectId }
            });
            await organizationSchema_1.default.findByIdAndUpdate(organizationId, {
                $pull: {
                    admins: userObjectId,
                    moderators: userObjectId,
                    superAdmins: userObjectId
                }
            });
        }
        console.log(orgObjectId);
        // if targetRole is admin, moderator, or superAdmin, remove the organizationId from the user
        if (targetRole === "admin" || targetRole === "moderator" || targetRole === "superAdmin") {
            await userSchema_1.default.findByIdAndUpdate(userId, {
                $pull: {
                    organizationId: new mongoose_1.Types.ObjectId(organizationId) // ✅ ObjectId পাঠাতে হবে
                }
            });
        }
        // For other roles (admin, moderator, member)
        let roleUpdate = {};
        if (targetRole === "admin") {
            roleUpdate.admins = userObjectId;
        }
        else if (targetRole === "moderator") {
            roleUpdate.moderators = userObjectId;
        }
        // Update the role in the organization
        if (Object.keys(roleUpdate).length > 0) {
            await organizationSchema_1.default.findByIdAndUpdate(organizationId, {
                $addToSet: roleUpdate
            });
        }
        res.status(200).json({
            success: true,
            message: `Role updated successfully`
        });
        return;
    }
    catch (err) {
        console.error("Error in role change:", err);
        res.status(500).json({ success: false, message: "Internal error in role change" });
        return;
    }
};
exports.default = handleRoleChange;
