import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import organizationType from "../../types/organizationType";

const registerOrg = async (req: Request, res: Response) => {
    const organizationData: organizationType = JSON.parse(req.body.organizationData);
    
    const user = (req as any).user
    const imageUrl = res.locals.imageUrl;

    try {
        const organization = await organizationModel.create({
            ...organizationData,
            owner: user._id,
            logoImage: imageUrl
        });
        res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Organization creation failed",
            error
        })
    }
}

export default registerOrg;


