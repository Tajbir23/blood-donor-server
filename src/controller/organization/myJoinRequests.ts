import { Request, Response } from "express";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";

const myJoinRequests = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Find all join requests for this user that are pending or accepted
        const joinRequests = await orgJoinRequestModel.find({
            userId,
            status: { $in: ["pending", "accepted"] }
        }).select("organizationId status");

        const joinedOrgIds = joinRequests.map(jr => jr.organizationId.toString());

        res.status(200).json({
            success: true,
            joinedOrgIds,
            joinRequests
        });
    } catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" });
    }
};

export default myJoinRequests;
