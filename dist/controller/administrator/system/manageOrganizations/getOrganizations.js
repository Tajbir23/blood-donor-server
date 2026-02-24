"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../../../models/organization/organizationSchema"));
const orgJoinRequestSchema_1 = __importDefault(require("../../../../models/organization/orgJoinRequestSchema"));
const getOrganizations = async (req, res) => {
    const { role } = req.user;
    if (role !== 'admin' && role !== 'superAdmin') {
        res.status(403).json({ message: "You are not authorized to access this resource" });
        return;
    }
    const { search, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    try {
        // Build query
        let query = {};
        // Only add status conditions if status is specified
        if (status) {
            query.isActive = status === 'active' ? true : status === 'inactive' ? false : true;
            if (status === 'ban') {
                query.isBanned = true;
                query.isActive = false;
            }
            else {
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
        const organizations = await organizationSchema_1.default.find(query)
            .skip(skip)
            .limit(Number(limit));
        const memberCounts = await orgJoinRequestSchema_1.default.aggregate([
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
        const organizationsWithMemberCount = organizations.map(org => {
            var _a;
            return ({
                ...org.toObject(),
                membersCount: ((_a = memberCounts.find(mc => mc._id.equals(org._id))) === null || _a === void 0 ? void 0 : _a.count) || 0
            });
        });
        const totalOrganizations = await organizationSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalOrganizations / Number(limit));
        res.status(200).json({ organizations: organizationsWithMemberCount, totalPages });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting organizations", error });
    }
};
exports.default = getOrganizations;
