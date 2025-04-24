"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const getAllModerators = async (req, res) => {
    const { page, limit, search } = req.query;
    const role = req.role;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    if (role !== "admin" && role !== "superAdmin") {
        res.status(403).json({ message: "You are not authorized to access this page" });
        return;
    }
    try {
        const query = { role: "moderator" };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
            ];
        }
        const moderators = await userSchema_1.default.find(query).skip((pageNumber - 1) * limitNumber).limit(limitNumber);
        const total = await userSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(total / limitNumber);
        res.status(200).json({ users: moderators, totalPages, totalUsers: total });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching moderators" });
    }
};
exports.default = getAllModerators;
