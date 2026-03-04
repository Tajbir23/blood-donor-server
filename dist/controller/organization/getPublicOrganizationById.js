"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Public endpoint — returns organization details without sensitive admin info.
 * If the user is logged in (Authorization header), also returns their membership status.
 */
const getPublicOrganizationById = async (req, res) => {
    var _a, _b, _c, _d;
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
        // Get owner basic info (public-safe fields only)
        const owner = await userSchema_1.default.findById(organization.owner, {
            fullName: 1, profileImage: 1, bloodGroup: 1
        }).lean();
        // Get total members count
        const membersCount = await userSchema_1.default.countDocuments({
            organizationId: organization._id
        });
        // ── Check user's membership status if logged in ───────────────────
        let membershipStatus = null; // null = not logged in
        // "owner" | "admin" | "member" | "pending" | "rejected" | null (no relation)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const userId = decoded._id;
                if (userId) {
                    // Check owner
                    if (((_a = organization.owner) === null || _a === void 0 ? void 0 : _a.toString()) === userId.toString()) {
                        membershipStatus = 'owner';
                    }
                    // Check admin roles
                    else if (((_b = organization.admins) === null || _b === void 0 ? void 0 : _b.some((id) => id.toString() === userId.toString())) ||
                        ((_c = organization.superAdmins) === null || _c === void 0 ? void 0 : _c.some((id) => id.toString() === userId.toString())) ||
                        ((_d = organization.moderators) === null || _d === void 0 ? void 0 : _d.some((id) => id.toString() === userId.toString()))) {
                        membershipStatus = 'admin';
                    }
                    else {
                        // Check join request status
                        const joinRequest = await orgJoinRequestSchema_1.default.findOne({ organizationId: organization._id, userId }).sort({ createdAt: -1 }).lean();
                        if (joinRequest) {
                            membershipStatus = joinRequest.status; // "pending" | "accepted" | "rejected"
                        }
                    }
                }
            }
            catch (_e) {
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
    }
    catch (error) {
        console.error(`[GetPublicOrgById] Failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে"
        });
    }
};
exports.default = getPublicOrganizationById;
