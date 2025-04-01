import { Request, Response } from "express";
import organizationModel from "../../models/organization/organizationSchema";

const allOrganizations = async (req: Request, res: Response) => {
    const { search } = req.query
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const query: { organizationName?: { $regex: RegExp }, isActive?: boolean, isBanned? : boolean } = {
        isActive: true,
        isBanned: false,
    };
    if (search && typeof search === 'string') {
        query.organizationName = { $regex: new RegExp(search, 'i') };
    }
    const organizations = await organizationModel.find(query).skip(startIndex).limit(limit);
    const totalOrganizations = await organizationModel.countDocuments(query);
    console.log(organizations)
    res.status(200).json( {organizations, totalOrganizations});
}

export default allOrganizations;