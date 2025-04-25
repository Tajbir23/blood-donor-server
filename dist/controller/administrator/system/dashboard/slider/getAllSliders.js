"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sliderSchema_1 = __importDefault(require("../../../../../models/slider/sliderSchema"));
const getAllSliders = async (req, res) => {
    const { page, limit, search } = req.query;
    try {
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sliders = await sliderSchema_1.default.find(query).skip(skip).limit(Number(limit));
        const total = await sliderSchema_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            message: "Sliders fetched successfully",
            sliders,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sliders",
            error: error
        });
    }
};
exports.default = getAllSliders;
