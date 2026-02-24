import { Request, Response } from "express";
import reportModel from "../../../../models/user/reportSchema";
import userModel from "../../../../models/user/userSchema";

const getOrgReports = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;
        const { page = 1, limit = 10, status = '', search = '' } = req.query;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Build query
        const query: any = { organizationId };

        if (status && status !== '') {
            query.status = status;
        }

        // If search is provided, find matching user IDs first
        if (search && typeof search === 'string' && search.trim() !== '') {
            const matchingUsers = await userModel.find({
                $or: [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            }).select('_id');

            const userIds = matchingUsers.map(u => u._id);
            query.reportedUserId = { $in: userIds };
        }

        const reports = await reportModel.find(query)
            .populate('reportedUserId', 'fullName email phone bloodGroup profileImageUrl reportCount')
            .populate('reporterUserId', 'fullName email profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();

        const total = await reportModel.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);

        // Get summary stats
        const [pendingCount, reviewedCount, resolvedCount, dismissedCount] = await Promise.all([
            reportModel.countDocuments({ organizationId, status: 'pending' }),
            reportModel.countDocuments({ organizationId, status: 'reviewed' }),
            reportModel.countDocuments({ organizationId, status: 'resolved' }),
            reportModel.countDocuments({ organizationId, status: 'dismissed' }),
        ]);

        res.status(200).json({
            success: true,
            reports,
            total,
            totalPages,
            currentPage: pageNumber,
            stats: {
                pending: pendingCount,
                reviewed: reviewedCount,
                resolved: resolvedCount,
                dismissed: dismissedCount,
                total: pendingCount + reviewedCount + resolvedCount + dismissedCount
            }
        });
    } catch (error) {
        console.error("Get org reports error:", error);
        res.status(500).json({
            success: false,
            message: "রিপোর্ট লোড করতে সমস্যা হয়েছে"
        });
    }
};

export default getOrgReports;
