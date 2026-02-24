"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reportSchema_1 = __importDefault(require("../../../../models/user/reportSchema"));
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const getOrgReports = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { page = 1, limit = 10, status = '', search = '' } = req.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        // Build query
        const query = { organizationId };
        if (status && status !== '') {
            query.status = status;
        }
        // If search is provided, find matching user IDs first
        if (search && typeof search === 'string' && search.trim() !== '') {
            const matchingUsers = await userSchema_1.default.find({
                $or: [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } }
                ]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);
            query.reportedUserId = { $in: userIds };
        }
        const reports = await reportSchema_1.default.find(query)
            .populate('reportedUserId', 'fullName email phone bloodGroup profileImageUrl reportCount')
            .populate('reporterUserId', 'fullName email profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();
        const total = await reportSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);
        // Get summary stats
        const [pendingCount, reviewedCount, resolvedCount, dismissedCount] = await Promise.all([
            reportSchema_1.default.countDocuments({ organizationId, status: 'pending' }),
            reportSchema_1.default.countDocuments({ organizationId, status: 'reviewed' }),
            reportSchema_1.default.countDocuments({ organizationId, status: 'resolved' }),
            reportSchema_1.default.countDocuments({ organizationId, status: 'dismissed' }),
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
    }
    catch (error) {
        console.error("Get org reports error:", error);
        res.status(500).json({
            success: false,
            message: "রিপোর্ট লোড করতে সমস্যা হয়েছে"
        });
    }
};
exports.default = getOrgReports;
