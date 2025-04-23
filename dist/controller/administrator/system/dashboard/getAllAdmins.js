"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const getAllAdmins = async (req, res) => {
    const { _id } = req.user;
    const role = req.role;
    const { search = '', page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    console.log("role", role);
    try {
        let isPermission = role === "superAdmin" ? true : false;
        console.log(isPermission);
        if (!isPermission) {
            res.status(403).json({
                success: false,
                message: "আপনার ডাটা অ্যাক্সেস এর অনুমতি নেই"
            });
            return;
        }
        const query = { role: "admin", _id: { $ne: _id } };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }
        const admins = await userSchema_1.default.find(query).select('-password -location -fingerPrint').skip((pageNumber - 1) * limitNumber).limit(limitNumber);
        const totalAdmins = await userSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalAdmins / limitNumber);
        res.status(200).json({
            success: true,
            message: "সকল অ্যাডমিন পাওয়া গেছে",
            users: admins,
            totalPages,
            totalUsers: totalAdmins
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "কোনো অ্যাডমিন পাওয়া যাইনি"
        });
    }
};
exports.default = getAllAdmins;
