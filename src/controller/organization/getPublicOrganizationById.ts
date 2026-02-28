import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import userModel from "../../models/user/userSchema";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";
import jwt from "jsonwebtoken";

/**
 * Public endpoint — returns organization details without sensitive admin info.
 * If the user is logged in (Authorization header), also returns their membership status.
 */
const getPublicOrganizationById = async (req: Request, res: Response) => {
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

        // Get owner basic info (public-safe fields only)
        const owner = await userModel.findById(organization.owner, {
            fullName: 1, profileImage: 1, bloodGroup: 1
        }).lean();

        // Get total members count
        const membersCount = await userModel.countDocuments({
            organizationId: organization._id
        });

        // ── Check user's membership status if logged in ───────────────────
        let membershipStatus: string | null = null; // null = not logged in
        // "owner" | "admin" | "member" | "pending" | "rejected" | null (no relation)
        
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
                const userId = decoded._id;

                if (userId) {
                    // Check owner
                    if (organization.owner?.toString() === userId.toString()) {
                        membershipStatus = 'owner';
                    }
                    // Check admin roles
                    else if (
                        organization.admins?.some((id: any) => id.toString() === userId.toString()) ||
                        organization.superAdmins?.some((id: any) => id.toString() === userId.toString()) ||
                        organization.moderators?.some((id: any) => id.toString() === userId.toString())
                    ) {
                        membershipStatus = 'admin';
                    }
                    else {
                        // Check join request status
                        const joinRequest = await orgJoinRequestModel.findOne(
                            { organizationId: organization._id, userId },
                        ).sort({ createdAt: -1 }).lean();

                        if (joinRequest) {
                            membershipStatus = joinRequest.status; // "pending" | "accepted" | "rejected"
                        }
                    }
                }
            } catch {
                // Invalid token — treat as not logged in, ignore
            }
        }

        // Return public-safe data only
        res.status(200).json({
            success: true,
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                organizationType: organization.organizationType,
                establishmentYear: organization.establishmentYear,
                registrationNumber: organization.registrationNumber,
                description: organization.description,
                website: organization.website,
                email: organization.email,
                phone: organization.phone,
                districtId: organization.districtId,
                thanaId: organization.thanaId,
                address: organization.address,
                representativeName: organization.representativeName,
                representativePosition: organization.representativePosition,
                hasBloodBank: organization.hasBloodBank,
                providesEmergencyBlood: organization.providesEmergencyBlood,
                availableBloodGroups: organization.availableBloodGroups,
                logoImage: organization.logoImage,
                isActive: organization.isActive,
                isBanned: organization.isBanned,
                createdAt: organization.createdAt,
                owner: owner ? {
                    fullName: owner.fullName,
                    profileImage: owner.profileImage,
                    bloodGroup: owner.bloodGroup
                } : null,
                membersCount,
                membershipStatus
            }
        });
    } catch (error: any) {
        console.error(`[GetPublicOrgById] Failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে"
        });
    }
};

export default getPublicOrganizationById;
