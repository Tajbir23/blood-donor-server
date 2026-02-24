"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const reportSchema_1 = __importDefault(require("../../models/user/reportSchema"));
const donationHistorySchema_1 = __importDefault(require("../../models/user/donationHistorySchema"));
const getOrgDashboardStats = async (req, res) => {
    var _a, _b, _c;
    try {
        const { organizationId } = req.params;
        const organization = await organizationSchema_1.default.findById(organizationId)
            .populate('owner', 'fullName profileImageUrl email')
            .lean();
        if (!organization) {
            res.status(404).json({ success: false, message: "সংগঠন খুঁজে পাওয়া যায়নি" });
            return;
        }
        // All members
        const allMembers = await userSchema_1.default.find({ organizationId: organizationId }, { password: 0, fingerPrint: 0, token: 0 }).lean();
        const totalMembers = allMembers.length;
        // Members who have donated at least once
        const activeDonors = allMembers.filter(m => m.lastDonationDate !== null && m.lastDonationDate !== undefined);
        const totalDonors = activeDonors.length;
        // Members who can currently donate
        const canDonateNow = allMembers.filter(m => m.canDonate === true).length;
        // Blood group distribution among members
        const bloodGroupMap = {};
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        bloodGroups.forEach(bg => bloodGroupMap[bg] = 0);
        allMembers.forEach(m => {
            if (m.bloodGroup && bloodGroupMap[m.bloodGroup] !== undefined) {
                bloodGroupMap[m.bloodGroup]++;
            }
        });
        const bloodGroupStats = bloodGroups.map(bg => ({ group: bg, count: bloodGroupMap[bg] }));
        // Pending join requests
        const pendingRequests = await orgJoinRequestSchema_1.default.countDocuments({
            organizationId,
            status: 'pending'
        });
        // Pending reports
        const pendingReports = await reportSchema_1.default.countDocuments({
            organizationId,
            status: 'pending'
        });
        const totalReports = await reportSchema_1.default.countDocuments({ organizationId });
        // Recent 5 members (most recently joined)
        const recentMembers = await userSchema_1.default.find({ organizationId: organizationId }, { fullName: 1, bloodGroup: 1, profileImageUrl: 1, lastDonationDate: 1, canDonate: 1, createdAt: 1, phone: 1 }).sort({ createdAt: -1 }).limit(5).lean();
        // Recent donations: members sorted by lastDonationDate desc
        const recentDonations = await userSchema_1.default.find({ organizationId: organizationId, lastDonationDate: { $exists: true, $ne: null } }, { fullName: 1, bloodGroup: 1, profileImageUrl: 1, lastDonationDate: 1, totalDonationCount: 1 }).sort({ lastDonationDate: -1 }).limit(5).lean();
        // Pending join requests (with user details)
        const pendingJoinRequests = await orgJoinRequestSchema_1.default.find({
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
        const monthlyDonations = await donationHistorySchema_1.default.aggregate([
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
        const adminCount = (((_a = organization.admins) === null || _a === void 0 ? void 0 : _a.length) || 0) +
            (((_b = organization.superAdmins) === null || _b === void 0 ? void 0 : _b.length) || 0) +
            (((_c = organization.moderators) === null || _c === void 0 ? void 0 : _c.length) || 0) + 1; // +1 for owner
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
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: "ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = getOrgDashboardStats;
