"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodRequestSchema_1 = __importDefault(require("../../models/blood/bloodRequestSchema"));
const getBloodRequests = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const bloodRequests = await bloodRequestSchema_1.default.find({})
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const totalBloodRequests = await bloodRequestSchema_1.default.countDocuments({});
        res.status(200).json({
            success: true,
            message: "Blood requests fetched successfully",
            data: bloodRequests,
            total: totalBloodRequests
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blood requests",
            error: error
        });
    }
};
exports.default = getBloodRequests;
