import { Request, Response } from "express";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";

const orgJoinRequest = async(req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { organizationId } = req.params;

        const existingRequest = await orgJoinRequestModel.findOne({ organizationId, userId, status: "pending" });
        if (existingRequest) {
            res.status(400).json({ message: "আপনি ইতোমধ্যে যোগদান এর জন্য আবেদন করেছেন। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
            return;
        }
        const newJoinRequest = new orgJoinRequestModel({
            organizationId,
            userId
        })
        await newJoinRequest.save();
        res.status(200).json({ message: "আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
    }
}
export default orgJoinRequest;