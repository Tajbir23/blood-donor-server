"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const myOrganizations = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find organizations where user is owner, admin, superAdmin, or moderator
        const organizations = await organizationSchema_1.default.find({
            $or: [
                { owner: userId },
                { admins: userId },
                { superAdmins: userId },
                { moderators: userId }
            ]
        }).populate([
            { path: 'owner', select: 'fullName email phone profileImageUrl' },
            { path: 'admins', select: 'fullName email phone profileImageUrl' },
            { path: 'superAdmins', select: 'fullName email phone profileImageUrl' },
            { path: 'moderators', select: 'fullName email phone profileImageUrl' }
        ]);
        res.status(200).json({
            success: true,
            count: organizations.length,
            organizations
        });
    }
    catch (error) {
        console.error("Error finding organizations:", error);
        res.status(500).json({ success: false, message: 'সার্ভার এ সমস্যা হয়েছে' });
    }
};
exports.default = myOrganizations;
