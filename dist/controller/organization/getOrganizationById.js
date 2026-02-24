"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const getOrganizationById = async (req, res) => {
    const { organizationId } = req.params;
    if (!organizationId) {
        res.status(400).json({
            success: false,
            message: "Organization ID is required"
        });
        return;
    }
    try {
        const organization = await organizationSchema_1.default.findById(organizationId).lean();
        if (!organization) {
            res.status(404).json({
                success: false,
                message: "প্রতিষ্ঠান খুঁজে পাওয়া যায়নি"
            });
            return;
        }
        // Get owner info
        const owner = await userSchema_1.default.findById(organization.owner, {
            fullName: 1, email: 1, phone: 1, profileImage: 1, bloodGroup: 1
        }).lean();
        // Get member count
        const membersCount = await orgJoinRequestSchema_1.default.countDocuments({
            organizationId: organization._id,
            status: 'accepted'
        });
        // Get total members (users with this org id)
        const totalMembers = await userSchema_1.default.countDocuments({
            organizationId: organization._id
        });
        // Get recent members (last 5)
        const recentMembers = await userSchema_1.default.find({ organizationId: organization._id }, { fullName: 1, email: 1, phone: 1, bloodGroup: 1, profileImage: 1, lastDonationDate: 1 }).sort({ createdAt: -1 }).limit(5).lean();
        // Get pending join requests count
        const pendingRequestsCount = await orgJoinRequestSchema_1.default.countDocuments({
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
    }
    catch (error) {
        console.error(`[GetOrgById] Failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে"
        });
    }
};
exports.default = getOrganizationById;
