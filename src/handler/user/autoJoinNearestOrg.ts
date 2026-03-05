import organizationModel from "../../models/organization/organizationSchema";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";

/**
 * রেজিস্ট্রেশনের পর ইউজারের সবচেয়ে কাছের (thana/district ভিত্তিক) 
 * active organization-এ স্বয়ংক্রিয়ভাবে join request পাঠায়।
 * 
 * ১. প্রথমে একই থানায় active org খোঁজে
 * ২. না পেলে একই জেলায় active org খোঁজে
 * ৩. পাওয়া গেলে pending join request তৈরি করে
 */
const autoJoinNearestOrg = async (userId: string, districtId: string, thanaId: string) => {
    try {
        // Step 1: Find active organizations in the same thana (closest match)
        let nearestOrg = await organizationModel.findOne({
            thanaId: thanaId,
            isActive: true,
            isBanned: false
        }).sort({ createdAt: 1 }); // oldest org first (more established)

        // Step 2: If no org in same thana, try same district
        if (!nearestOrg) {
            nearestOrg = await organizationModel.findOne({
                districtId: districtId,
                isActive: true,
                isBanned: false
            }).sort({ createdAt: 1 });
        }

        // No nearby organization found — nothing to do
        if (!nearestOrg) {
            console.log(`[AutoJoin] No nearby active organization found for user ${userId} (district: ${districtId}, thana: ${thanaId})`);
            return null;
        }

        // Check if user is already the owner/admin/moderator of this org
        const isAlreadyAdmin = 
            nearestOrg.owner?.toString() === userId ||
            nearestOrg.admins?.some((id: any) => id.toString() === userId) ||
            nearestOrg.superAdmins?.some((id: any) => id.toString() === userId) ||
            nearestOrg.moderators?.some((id: any) => id.toString() === userId);

        if (isAlreadyAdmin) {
            return null;
        }

        // Check if a join request already exists
        const existingRequest = await orgJoinRequestModel.findOne({
            organizationId: nearestOrg._id,
            userId: userId
        });

        if (existingRequest) {
            console.log(`[AutoJoin] Join request already exists for user ${userId} → org ${nearestOrg.organizationName}`);
            return existingRequest;
        }

        // Create auto join request
        const joinRequest = await orgJoinRequestModel.create({
            organizationId: nearestOrg._id,
            userId: userId,
            status: "pending"
        });

        console.log(`[AutoJoin] Auto join request created: user ${userId} → org "${nearestOrg.organizationName}" (${nearestOrg._id})`);
        return joinRequest;

    } catch (error) {
        console.error("[AutoJoin] Error creating auto join request:", error);
        return null;
    }
};

export default autoJoinNearestOrg;
