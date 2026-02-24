import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import organizationModel from "../../models/organization/organizationSchema";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";
import reportModel from "../../models/user/reportSchema";
import donationHistoryModel from "../../models/user/donationHistorySchema";

const getOrgDashboardStats = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;

        const organization = await organizationModel.findById(organizationId)
            .populate('owner', 'fullName profileImageUrl email')
            .lean();

        if (!organization) {
            res.status(404).json({ success: false, message: "সংগঠন খুঁজে পাওয়া যায়নি" });
            return;
        }

        // All members
        const allMembers = await userModel.find(
            { organizationId: organizationId },
            { password: 0, fingerPrint: 0, token: 0 }
        ).lean();

        const totalMembers = allMembers.length;

        // Members who have donated at least once
        const activeDonors = allMembers.filter(m => m.lastDonationDate !== null && m.lastDonationDate !== undefined);
        const totalDonors = activeDonors.length;

        // Members who can currently donate
        const canDonateNow = allMembers.filter(m => m.canDonate === true).length;

        // Blood group distribution among members
        const bloodGroupMap: Record<string, number> = {};
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        bloodGroups.forEach(bg => bloodGroupMap[bg] = 0);
        allMembers.forEach(m => {
            if (m.bloodGroup && bloodGroupMap[m.bloodGroup] !== undefined) {
                bloodGroupMap[m.bloodGroup]++;
            }
        });
        const bloodGroupStats = bloodGroups.map(bg => ({ group: bg, count: bloodGroupMap[bg] }));

        // Pending join requests
        const pendingRequests = await orgJoinRequestModel.countDocuments({
            organizationId,
            status: 'pending'
        });

        // Pending reports
        const pendingReports = await reportModel.countDocuments({
            organizationId,
            status: 'pending'
        });

        const totalReports = await reportModel.countDocuments({ organizationId });

        // Recent 5 members (most recently joined)
        const recentMembers = await userModel.find(
            { organizationId: organizationId },
            { fullName: 1, bloodGroup: 1, profileImageUrl: 1, lastDonationDate: 1, canDonate: 1, createdAt: 1, phone: 1 }
        ).sort({ createdAt: -1 }).limit(5).lean();

        // Recent donations: members sorted by lastDonationDate desc
        const recentDonations = await userModel.find(
            { organizationId: organizationId, lastDonationDate: { $exists: true, $ne: null } },
            { fullName: 1, bloodGroup: 1, profileImageUrl: 1, lastDonationDate: 1, totalDonationCount: 1 }
        ).sort({ lastDonationDate: -1 }).limit(5).lean();

        // Pending join requests (with user details)
        const pendingJoinRequests = await orgJoinRequestModel.find({
            organizationId,
            status: 'pending'
        })
        .populate('userId', 'fullName bloodGroup profileImageUrl phone')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        // Total donation count across all members
        const totalDonationCount = allMembers.reduce((sum, m) => sum + (m.totalDonationCount || 0), 0);

        // Donation history for the last 6 months (for chart)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const memberIds = allMembers.map(m => m._id);
        const monthlyDonations = await donationHistoryModel.aggregate([
            {
                $match: {
                    userId: { $in: memberIds },
                    donationDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$donationDate" },
                        month: { $month: "$donationDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Admin/role counts
        const adminCount = (organization.admins?.length || 0) +
            (organization.superAdmins?.length || 0) +
            (organization.moderators?.length || 0) + 1; // +1 for owner

        res.status(200).json({
            success: true,
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                organizationType: organization.organizationType,
                logoImage: organization.logoImage,
                isActive: organization.isActive,
                isBanned: organization.isBanned,
                owner: organization.owner,
                establishmentYear: organization.establishmentYear,
                email: organization.email,
                phone: organization.phone,
                hasBloodBank: organization.hasBloodBank,
                providesEmergencyBlood: organization.providesEmergencyBlood,
                availableBloodGroups: organization.availableBloodGroups,
            },
            stats: {
                totalMembers,
                totalDonors,
                canDonateNow,
                pendingRequests,
                pendingReports,
                totalReports,
                totalDonationCount,
                adminCount,
            },
            bloodGroupStats,
            recentMembers,
            recentDonations,
            pendingJoinRequests,
            monthlyDonations,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: "ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে" });
    }
};

export default getOrgDashboardStats;
