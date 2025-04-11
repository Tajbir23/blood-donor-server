import { Request, Response } from "express";
import organizationModel from "../../../../models/organization/organizationSchema";

const manageOrg = async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const { status } = req.body;

    console.log(req.body , organizationId, "calling it")
    const { role } = (req as any).user 

    if(role !== 'admin' && role !== 'superAdmin'){
        res.status(403).json({ message: "You are not authorized to access this resource" });
        return;
    }

    try {
        const organization = await organizationModel.findById(organizationId);
        console.log(organization, "organization")
    if (!organization) {
        res.status(404).json({ message: "Organization not found" });
        return;
    }

    if(status === 'active'){
        organization.isActive = true;
    }else if(status === 'inactive'){
        organization.isActive = false;
    }else if(status === 'ban'){
        organization.isActive = false;
        organization.isBanned = true;
    }else if(status === 'unban'){
        console.log("unban")
        organization.isActive = true;
        organization.isBanned = false;
    }else if(status === 'delete'){
        await organizationModel.findByIdAndDelete(organizationId);
    }

        await organization.save();
        res.status(200).json({success: true, message: "Organization updated successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Error updating organization", error });
    }
}

export default manageOrg
