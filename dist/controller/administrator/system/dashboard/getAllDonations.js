"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const donationHistorySchema_1 = __importDefault(require("../../../../models/user/donationHistorySchema"));
const getAllDonations = async (req, res) => {
    var _a;
    const { search = '', page = 1, limit = 10, bloodGroup, startDate, endDate } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    try {
        const pipeline = [
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
        const matchConditions = [];
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
            const dateFilter = {};
            if (startDate)
                dateFilter.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
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
        const countResult = await donationHistorySchema_1.default.aggregate(countPipeline);
        const totalDonations = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const totalPages = Math.ceil(totalDonations / limitNumber);
        // Paginate and project
        pipeline.push({ $skip: (pageNumber - 1) * limitNumber }, { $limit: limitNumber }, {
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
        });
        const donations = await donationHistorySchema_1.default.aggregate(pipeline);
        res.status(200).json({
            donations,
            totalPages,
            totalDonations,
            currentPage: pageNumber
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching donations",
            error: error.message
        });
    }
};
exports.default = getAllDonations;
