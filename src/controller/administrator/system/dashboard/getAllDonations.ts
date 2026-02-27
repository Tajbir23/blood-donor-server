import { Request, Response } from "express";
import donationHistoryModel from "../../../../models/user/donationHistorySchema";

const getAllDonations = async (req: Request, res: Response) => {
    const { search = '', page = 1, limit = 10, bloodGroup, startDate, endDate } = req.query;
    const pageNumber = parseInt(page as any) || 1;
    const limitNumber = parseInt(limit as any) || 10;

    try {
        const pipeline: any[] = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "donor"
                }
            },
            { $unwind: { path: "$donor", preserveNullAndEmptyArrays: true } }
        ];

        const matchConditions: any[] = [];

        // Search by donor name, email, phone, or recipient name
        if (search) {
            matchConditions.push({
                $or: [
                    { "donor.fullName": { $regex: search, $options: "i" } },
                    { "donor.email": { $regex: search, $options: "i" } },
                    { "donor.phone": { $regex: search, $options: "i" } },
                    { recipientName: { $regex: search, $options: "i" } }
                ]
            });
        }

        // Filter by blood group
        if (bloodGroup && bloodGroup !== 'all') {
            matchConditions.push({ "donor.bloodGroup": bloodGroup });
        }

        // Filter by date range
        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) dateFilter.$gte = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            matchConditions.push({ donationDate: dateFilter });
        }

        if (matchConditions.length > 0) {
            pipeline.push({ $match: { $and: matchConditions } });
        }

        // Sort by donation date descending
        pipeline.push({ $sort: { donationDate: -1 } });

        // Count total
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await donationHistoryModel.aggregate(countPipeline);
        const totalDonations = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalDonations / limitNumber);

        // Paginate and project
        pipeline.push(
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
            {
                $project: {
                    _id: 1,
                    donationDate: 1,
                    recipient: 1,
                    recipientName: 1,
                    createdAt: 1,
                    "donor._id": 1,
                    "donor.fullName": 1,
                    "donor.email": 1,
                    "donor.phone": 1,
                    "donor.bloodGroup": 1,
                    "donor.image": 1,
                    "donor.totalDonationCount": 1
                }
            }
        );

        const donations = await donationHistoryModel.aggregate(pipeline);

        res.status(200).json({
            donations,
            totalPages,
            totalDonations,
            currentPage: pageNumber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching donations",
            error: (error as Error).message
        });
    }
};

export default getAllDonations;
