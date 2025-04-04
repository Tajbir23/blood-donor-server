"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const verifyOrganizationAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { organizationId } = req.params; // API তে orgId পাঠাতে হবে
        if (!organizationId) {
            res.status(400).json({ message: "সংগঠনের ID প্রদান করুন" });
            return;
        }
        const organization = await organizationSchema_1.default.findById(organizationId);
        if (!organization) {
            res.status(404).json({ message: "সংগঠন খুঁজে পাওয়া যায়নি" });
            return;
        }
        const isAdmin = organization.owner.toString() === userId.toString() ||
            organization.admins.includes(userId) ||
            organization.superAdmins.includes(userId) ||
            organization.moderators.includes(userId);
        if (!isAdmin) {
            res.status(403).json({ message: "আপনার এই অপারেশন করার অনুমতি নেই" });
            return;
        }
        req.role =
            organization.owner.toString() === userId.toString()
                ? "owner"
                : organization.admins.includes(userId)
                    ? "admin"
                    : organization.superAdmins.includes(userId)
                        ? "superAdmin"
                        : "moderator";
        return next();
    }
    catch (error) {
        console.error("verifyOrganizationAdmin Error:", error);
        res.status(500).json({ message: "সার্ভার ত্রুটি" });
    }
};
exports.default = verifyOrganizationAdmin;
