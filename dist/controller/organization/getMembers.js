"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const getMembers = async (req, res) => {
    const { organizationId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    try {
        // Build query with search functionality
        let query = { organizationId: organizationId };
        // Add search condition if search parameter is provided
        if (search && typeof search === 'string' && search.trim() !== '') {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { bloodGroup: { $regex: search, $options: "i" } }
            ];
        }
        const members = await userSchema_1.default.find(query, { password: 0, fingerPrint: 0 }).skip(skip).limit(limitNumber).lean();
        // Get total count for pagination
        const totalMembers = await userSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalMembers / limitNumber);
        res.status(200).json({
            success: true,
            members,
            totalPages
        });
    }
    catch (error) {
        console.error("Error fetching organization members:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch organization members"
        });
    }
};
exports.default = getMembers;
