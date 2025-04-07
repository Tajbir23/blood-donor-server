import { Request, Response } from "express";
import organizationModel from "../../../../models/organization/organizationSchema";
import orgJoinRequestModel from "../../../../models/organization/orgJoinRequestSchema";

const getOrganizations = async (req: Request, res: Response) => {
    const { role } = (req as any).user 

    if(role !== 'admin' && role !== 'superAdmin'){
        res.status(403).json({ message: "You are not authorized to access this resource" });
        return;
    }

    const { search, status, page = 1, limit = 10 } = req.query; 
    const skip = (Number(page) - 1) * Number(limit);
    
    console.log(status)
    try {
        // Build query
        let query: any = {};
        
        // Only add status conditions if status is specified
        if (status) {
            query.isActive = status === 'active' ? true : status === 'inactive' ? false : true;
            if (status === 'ban') {
                query.isBanned = true;
                query.isActive = false;
            } else {
                query.isBanned = false;
            }
        }
        
        
        // Only add search condition if search is a valid string
        if (search && typeof search === 'string' && search.trim() !== '') {
            query.$or = [
                { organizationName: { $regex: search, $options: "i" } },
                { registrationNumber: { $regex: search, $options: "i" } },
            ];
        }
        
        const organizations = await organizationModel.find(query)
            .skip(skip)
            .limit(Number(limit));
        
        const memberCounts = await orgJoinRequestModel.aggregate([
            {
                $match: {
                    organizationId: { $in: organizations.map(org => org._id) }
                }
            },
            {
                $group: {
                    _id: '$organizationId',
                    count: { $sum: 1 }
                }
            }
        ]);

        const organizationsWithMemberCount = organizations.map(org => ({
            ...org.toObject(),
            memberCount: memberCounts.find(mc => mc._id.equals(org._id))?.count || 0
        }));

        const totalOrganizations = await organizationModel.countDocuments(query);
        const totalPages = Math.ceil(totalOrganizations / Number(limit));

        
        res.status(200).json({ organizations, totalPages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting organizations", error });
    }
}

export default getOrganizations;
