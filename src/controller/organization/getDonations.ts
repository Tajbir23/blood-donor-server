import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const getDonations = async (req: Request, res: Response) => {
    const { organizationId } = req.params;
    const {
        page = 1,
        limit = 10,
        search = "",
        bloodGroup = "",
        fromDate = "",
        toDate = "",
    } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    try {
        // Base query: members of this organization who have donated at least once
        let query: any = {
            organizationId: organizationId,
            lastDonationDate: { $exists: true, $ne: null },
        };

        // Search by name, bloodGroup, phone
        if (search && typeof search === "string" && search.trim() !== "") {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { bloodGroup: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by blood group
        if (bloodGroup && typeof bloodGroup === "string" && bloodGroup.trim() !== "") {
            query.bloodGroup = bloodGroup;
        }

        // Filter by date range
        if (fromDate || toDate) {
            query.lastDonationDate = query.lastDonationDate || {};
            if (fromDate) {
                query.lastDonationDate.$gte = new Date(fromDate as string);
            }
            if (toDate) {
                query.lastDonationDate.$lte = new Date(toDate as string);
            }
        }

        const donors = await userModel
            .find(query, {
                fullName: 1,
                bloodGroup: 1,
                lastDonationDate: 1,
                donationCount: 1,
                profileImageUrl: 1,
                districtId: 1,
                thanaId: 1,
            })
            .sort({ lastDonationDate: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();

        const total = await userModel.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);

        // Blood group stats summary
        const bloodGroupStats = await userModel.aggregate([
            {
                $match: {
                    organizationId: organizationId,
                    lastDonationDate: { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: "$bloodGroup",
                    count: { $sum: "$donationCount" },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            donations: donors,
            total,
            totalPages,
            currentPage: pageNumber,
            bloodGroupStats,
        });
    } catch (error) {
        console.error("Error fetching organization donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch donation records",
        });
    }
};

export default getDonations;
