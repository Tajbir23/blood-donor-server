"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../../../models/organization/orgJoinRequestSchema"));
const getPendingMembers = async (req, res) => {
    const { organizationId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;
    // Create base query
    const baseQuery = { organizationId: organizationId, status: "pending" };
    // Add search functionality
    let searchQuery = {};
    if (search) {
        searchQuery = {
            $or: [
                { 'userId.name': { $regex: search, $options: 'i' } },
                { 'userId.email': { $regex: search, $options: 'i' } },
                { 'userId.phone': { $regex: search, $options: 'i' } }
            ]
        };
    }
    // Combine queries
    const query = search ? { ...baseQuery, ...searchQuery } : baseQuery;
    // Execute query with search
    const pendingMembers = await orgJoinRequestSchema_1.default.find(baseQuery)
        .populate({
        path: 'userId',
        select: '-password -fingerprint',
        match: search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ]
        } : {}
    })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
    // Filter out null results from populate match
    const filteredMembers = pendingMembers.filter(member => member.userId !== null);
    // Count total matching documents for pagination
    const totalPendingMembers = await orgJoinRequestSchema_1.default.countDocuments(baseQuery);
    res.status(200).json({
        pendingMembers: filteredMembers,
        totalPendingMembers,
        totalPages: Math.ceil(totalPendingMembers / Number(limit))
    });
};
exports.default = getPendingMembers;
