"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const removeActiveUser_1 = __importDefault(require("../../handler/user/removeActiveUser"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const logoutUser = async (req, res) => {
    const { _id } = req.user;
    (0, removeActiveUser_1.default)(_id);
    await userSchema_1.default.findByIdAndUpdate(_id, { token: null });
    // Clear the token cookie from the browser
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ success: true, message: "লগ আউট সম্পন্ন হয়েছে" });
};
exports.default = logoutUser;
