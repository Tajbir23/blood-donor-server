"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
/**
 * Public endpoint — returns organization details without sensitive admin info
 */
const getPublicOrganizationById = async (req, res) => {
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
        // Return public-safe data only (no pending requests, no recent members details, no representative email/phone)
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
                membersCount
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
