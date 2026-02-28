import { Request, Response } from "express";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";
import organizationModel from "../../models/organization/organizationSchema";

const orgJoinRequest = async(req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { organizationId } = req.params;

        // Check if user is already the owner of this organization
        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            res.status(404).json({ success: false, message: "প্রতিষ্ঠানটি খুঁজে পাওয়া যায়নি।" });
            return;
        }

        if (organization.owner?.toString() === userId.toString()) {
            res.status(400).json({ success: false, message: "আপনি এই প্রতিষ্ঠানের মালিক। আবার যোগদান করার প্রয়োজন নেই।" });
            return;
        }

        // Check if user is already an admin/superAdmin/moderator
        const isAdmin = organization.admins?.some((id: any) => id.toString() === userId.toString());
        const isSuperAdmin = organization.superAdmins?.some((id: any) => id.toString() === userId.toString());
        const isModerator = organization.moderators?.some((id: any) => id.toString() === userId.toString());

        if (isAdmin || isSuperAdmin || isModerator) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে এই প্রতিষ্ঠানের একজন পরিচালক।" });
            return;
        }

        // Check if user already has an accepted join request (already a member)
        const existingAccepted = await orgJoinRequestModel.findOne({ organizationId, userId, status: "accepted" });
        if (existingAccepted) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে এই প্রতিষ্ঠানের সদস্য।" });
            return;
        }

        // Check if user already has a pending join request
        const existingPending = await orgJoinRequestModel.findOne({ organizationId, userId, status: "pending" });
        if (existingPending) {
            res.status(400).json({ success: false, message: "আপনি ইতোমধ্যে যোগদান এর জন্য আবেদন করেছেন। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
            return;
        }

        const newJoinRequest = new orgJoinRequestModel({
            organizationId,
            userId
        })
        await newJoinRequest.save();
        res.status(200).json({ success: true, message: "আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export default orgJoinRequest;