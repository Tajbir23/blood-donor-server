"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const updateOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const userId = req.user._id;
        const organization = await organizationSchema_1.default.findById(organizationId);
        if (!organization) {
            res.status(404).json({ success: false, message: "সংগঠন খুঁজে পাওয়া যায়নি" });
            return;
        }
        // Only owner can update organization settings
        if (organization.owner.toString() !== userId.toString()) {
            res.status(403).json({ success: false, message: "শুধুমাত্র প্রতিষ্ঠানের মালিক সেটিংস পরিবর্তন করতে পারেন" });
            return;
        }
        // Allowed fields to update
        const allowedFields = [
            'organizationName', 'organizationType', 'description',
            'email', 'phone', 'website',
            'address',
            'representativeName', 'representativePosition',
            'representativePhone', 'representativeEmail',
            'hasBloodBank', 'providesEmergencyBlood', 'availableBloodGroups'
        ];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ success: false, message: "কোনো তথ্য আপডেট করা হয়নি" });
            return;
        }
        const updatedOrg = await organizationSchema_1.default.findByIdAndUpdate(organizationId, { $set: updates }, { new: true, runValidators: true }).lean();
        res.status(200).json({
            success: true,
            message: "প্রতিষ্ঠানের তথ্য সফলভাবে আপডেট হয়েছে",
            organization: updatedOrg
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, message: "এই নামের একটি প্রতিষ্ঠান ইতিমধ্যে রয়েছে" });
            return;
        }
        console.error("Update organization error:", error);
        res.status(500).json({ success: false, message: "প্রতিষ্ঠানের তথ্য আপডেট করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = updateOrganization;
