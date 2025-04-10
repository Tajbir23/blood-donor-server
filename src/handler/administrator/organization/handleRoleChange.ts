import { Response } from "express";
import { Types } from "mongoose";
import organizationModel from "../../../models/organization/organizationSchema";
import userModel from "../../../models/user/userSchema";

// ✅ Helper Function — Updated for Single Owner Support
const handleRoleChange = async (
    organizationId: string,
    userId: string,
    targetRole: string,
    res: Response,
    isOwner: boolean = false
) => {
    try {
        const userObjectId = new Types.ObjectId(userId);
        const orgObjectId = new Types.ObjectId(organizationId);

        // Fetch the current organization data to check the existing owner
        const organization = await organizationModel.findById(organizationId);
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
            await organizationModel.findByIdAndUpdate(organizationId, {
                $unset: { ownerId: "" }
            });

            // Set new owner
            await organizationModel.findByIdAndUpdate(organizationId, {
                $set: { ownerId: userObjectId }
            });

            const user = await userModel.findById(userId);
            res.status(200).json({
                success: true,
                message: `${user?.fullName} is now the owner of the organization`
            });
            return;
        }

        // Remove from all roles (admin and moderator)
        await organizationModel.findByIdAndUpdate(organizationId, {
            $pull: {
                admins: userObjectId,
                moderators: userObjectId
            }
        });

        // if targetRole is member, add the organizationId to the user and remove from other roles
        if (targetRole === "member") {
            await userModel.findByIdAndUpdate(userId, {
                $addToSet: { organizations: orgObjectId }
            });

            await organizationModel.findByIdAndUpdate(organizationId, {
                $pull: {
                    admins: userObjectId,
                    moderators: userObjectId,
                    superAdmins: userObjectId
                }
            });
        }

        console.log(orgObjectId)

        // if targetRole is admin, moderator, or superAdmin, remove the organizationId from the user
        if (targetRole === "admin" || targetRole === "moderator" || targetRole === "superAdmin") {
            await userModel.findByIdAndUpdate(userId, {
                $pull: {
                  organizationId: new Types.ObjectId(organizationId) // ✅ ObjectId পাঠাতে হবে
                }
              });
        }
        

        // For other roles (admin, moderator, member)
        let roleUpdate: any = {};
        if (targetRole === "admin") {
            roleUpdate.admins = userObjectId;
        } else if (targetRole === "moderator") {
            roleUpdate.moderators = userObjectId;
        }

        // Update the role in the organization
        if (Object.keys(roleUpdate).length > 0) {
            await organizationModel.findByIdAndUpdate(organizationId, {
                $addToSet: roleUpdate
            });
        }

        res.status(200).json({
            success: true,
            message: `Role updated successfully`
        });
        return;

    } catch (err) {
        console.error("Error in role change:", err);
        res.status(500).json({ success: false, message: "Internal error in role change" });
        return;
    }
};

export default handleRoleChange;
