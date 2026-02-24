import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";
import userModel from "../../models/user/userSchema";

const getOrganizationById = async (req: Request, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId) {
        res.status(400).json({
            success: false,
            message: "Organization ID is required"
        });
        return;
    }

    try {
        const organization = await organizationModel.findById(organizationId).lean();

        if (!organization) {
            res.status(404).json({
                success: false,
                message: "প্রতিষ্ঠান খুঁজে পাওয়া যায়নি"
            });
            return;
        }

        // Get owner info
        const owner = await userModel.findById(organization.owner, {
            fullName: 1, email: 1, phone: 1, profileImage: 1, bloodGroup: 1
        }).lean();

        // Get member count
        const membersCount = await orgJoinRequestModel.countDocuments({
            organizationId: organization._id,
            status: 'accepted'
        });

        // Get total members (users with this org id)
        const totalMembers = await userModel.countDocuments({
            organizationId: organization._id
        });

        // Get recent members (last 5)
        const recentMembers = await userModel.find(
            { organizationId: organization._id },
            { fullName: 1, email: 1, phone: 1, bloodGroup: 1, profileImage: 1, lastDonationDate: 1 }
        ).sort({ createdAt: -1 }).limit(5).lean();

        // Get pending join requests count
        const pendingRequestsCount = await orgJoinRequestModel.countDocuments({
            organizationId: organization._id,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            organization: {
                ...organization,
                owner,
                membersCount: totalMembers,
                pendingRequestsCount,
                recentMembers
            }
        });
    } catch (error: any) {
        console.error(`[GetOrgById] Failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে"
        });
    }
};

export default getOrganizationById;
