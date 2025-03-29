import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";
import organizationType from "../../types/organizationType";

const registerOrg = async (req: Request, res: Response) => {
    const organizationData: organizationType = req.body;
    const imageUrl = res.locals.imageUrl;

    try {
        const organization = await organizationModel.create({
            ...organizationData,
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


