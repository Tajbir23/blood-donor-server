import { Request, Response } from "express";
import organizationModel from "../../../../models/organization/organizationSchema";

const updateOrgCover = async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const imageUrl = res.locals.imageUrl;

    try {
        const organization = await organizationModel.findByIdAndUpdate(organizationId, { $set: { logoImage: imageUrl } });
        if (!organization) {
            res.status(404).json({ success: false, message: "Organization not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Organization cover image updated successfully" });
    } catch (error) {
        console.log(error);
    }
    
}

export default updateOrgCover;

