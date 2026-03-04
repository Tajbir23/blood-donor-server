"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const orgJoinRequest = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = req.user._id;
        const { organizationId } = req.params;
        // Check if user is already the owner of this organization
        const organization = await organizationSchema_1.default.findById(organizationId);
        if (!organization) {
            res.status(404).json({ success: false, message: "প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।" });
            return;
        }
        if (((_a = organization.owner) === null || _a === void 0 ? void 0 : _a.toString()) === userId.toString()) {
            res.status(400).json({ success: false, message: "আপনি এই প্রতিষ্ঠানের মালিক। আবার যোগদান করার প্রয়োজন নেই।" });
            return;
        }
        // Check if user is already an admin/superAdmin/moderator
        const isAdmin = (_b = organization.admins) === null || _b === void 0 ? void 0 : _b.some((id) => id.toString() === userId.toString());
        const isSuperAdmin = (_c = organization.superAdmins) === null || _c === void 0 ? void 0 : _c.some((id) => id.toString() === userId.toString());
        const isModerator = (_d = organization.moderators) === null || _d === void 0 ? void 0 : _d.some((id) => id.toString() === userId.toString());
        if (isAdmin || isSuperAdmin || isModerator) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে এই প্রতিষ্ঠানের একজন পরিচালক।" });
            return;
        }
        // Check if user already has an accepted join request (already a member)
        const existingAccepted = await orgJoinRequestSchema_1.default.findOne({ organizationId, userId, status: "accepted" });
        if (existingAccepted) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে এই প্রতিষ্ঠানের সদস্য।" });
            return;
        }
        // Check if user already has a pending join request
        const existingPending = await orgJoinRequestSchema_1.default.findOne({ organizationId, userId, status: "pending" });
        if (existingPending) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে যোগদান এর জন্য আবেদন করেছেন। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
            return;
        }
        const newJoinRequest = new orgJoinRequestSchema_1.default({
            organizationId,
            userId
        });
        await newJoinRequest.save();
        res.status(200).json({ success: true, message: "আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = orgJoinRequest;
