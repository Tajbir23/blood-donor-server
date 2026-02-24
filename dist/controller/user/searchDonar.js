"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const searchDonar = async (req, res) => {
    const { search = "" } = req.query;
    const donors = await userSchema_1.default.find({
        $or: [
            { fullName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { _id: search.toString().match(/^[0-9a-fA-F]{24}$/) ? search : null }
        ],
        isBanned: { $ne: true },
        isActive: true,
        isVerified: true,
    }).select("-password -fingerPrint -location -token").limit(5);
    res.status(200).json({ success: true, donors });
};
exports.default = searchDonar;
