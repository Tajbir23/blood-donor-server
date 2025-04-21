"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const getAllUsers = async (req, res) => {
    const { search = '', page = 1, limit = 10, isActive, isBanned, allUser } = req.query;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    try {
        const query = {
            role: 'user',
            // isActive: isActive === 'true' ? true : false,
            // isBanned: isBanned === 'true' ? true : false
        };
        if (isActive) {
            query.isActive = isActive === 'true' ? true : false;
        }
        if (isBanned) {
            query.isBanned = isBanned === 'true' ? true : false;
        }
        if (allUser === 'true') {
            query.role = 'user';
            delete query.isActive;
            delete query.isBanned;
        }
        console.log(req.query);
        console.log(query);
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
            // Only try to match ObjectId if the search string looks like one
            if (/^[0-9a-fA-F]{24}$/.test(search)) {
                query.$or.push({ _id: search });
            }
        }
        const users = await userSchema_1.default.find(query)
            .select('-password -location -fingerPrint')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalUsers = await userSchema_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNumber);
        res.status(200).json({
            users,
            totalPages,
            totalUsers
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};
exports.default = getAllUsers;
