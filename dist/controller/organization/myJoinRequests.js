"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const myJoinRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        // Find all join requests for this user that are pending or accepted
        const joinRequests = await orgJoinRequestSchema_1.default.find({
            userId,
            status: { $in: ["pending", "accepted"] }
        }).select("organizationId status");
        const joinedOrgIds = joinRequests.map(jr => jr.organizationId.toString());
        res.status(200).json({
            success: true,
            joinedOrgIds,
            joinRequests
        });
    }
    catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({ success: false, message: "সার্ভারে সমস্যা হয়েছে" });
    }
};
exports.default = myJoinRequests;
