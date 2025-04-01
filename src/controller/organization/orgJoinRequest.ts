import { Request, Response } from "express";
import orgJoinRequestModel from "../../models/organization/orgJoinRequestSchema";

const orgJoinRequest = async(req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { organizationId } = req.body;
        const newJoinRequest = new orgJoinRequestModel({
            organizationId,
            userId
        })
        await newJoinRequest.save();
        res.status(200).json({ message: "Join request sent successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
    }
}
export default orgJoinRequest;