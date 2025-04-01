import { Request, Response, NextFunction } from "express";
import organizationModel from "../../models/organization/organizationSchema";

const verifyOrganizationAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user._id;
        const { organizationId } = req.params; // API তে orgId পাঠাতে হবে

        if (!organizationId) {
            res.status(400).json({ message: "সংগঠনের ID প্রদান করুন" });
            return;
        }

        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            res.status(404).json({ message: "সংগঠন খুঁজে পাওয়া যায়নি" });
            return;
        }

        const isAdmin = 
            organization.owner.toString() === userId.toString() ||
            organization.admins.includes(userId) ||
            organization.superAdmins.includes(userId) ||
            organization.moderators.includes(userId);

        if (!isAdmin) {
            res.status(403).json({ message: "আপনার এই অপারেশন করার অনুমতি নেই" });
            return;
        }

        (req as any).role = 
        organization.owner.toString() === userId.toString()
            ? "owner"
            : organization.admins.includes(userId)
            ? "admin"
            : organization.superAdmins.includes(userId)
            ? "superAdmin"
            : "moderator";


        return next();
    } catch (error) {
        console.error("verifyOrganizationAdmin Error:", error);
        res.status(500).json({ message: "সার্ভার ত্রুটি" });
    }
};

export default verifyOrganizationAdmin;
