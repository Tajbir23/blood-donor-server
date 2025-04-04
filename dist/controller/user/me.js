"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const me = async (req, res) => {
    try {
        const userRequest = req;
        const user = await userSchema_1.default.findById(userRequest.user._id)
            .select('-password')
            .populate({
            path: 'organizationId',
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        console.log(user);
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};
exports.default = me;
