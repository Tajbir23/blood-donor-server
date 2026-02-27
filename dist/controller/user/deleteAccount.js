"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const verifyPass_1 = __importDefault(require("../../handler/validation/verifyPass"));
const deleteAccount = async (req, res) => {
    try {
        const userRequest = req;
        const { password } = req.body;
        if (!password) {
            res.status(400).json({ success: false, message: 'অ্যাকাউন্ট ডিলিট করতে পাসওয়ার্ড দিন' });
            return;
        }
        const user = await userSchema_1.default.findById(userRequest.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }
        const isPasswordValid = await (0, verifyPass_1.default)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'পাসওয়ার্ড ভুল হয়েছে' });
            return;
        }
        await userSchema_1.default.findByIdAndDelete(userRequest.user._id);
        res.clearCookie("token");
        res.status(200).json({ success: true, message: 'অ্যাকাউন্ট সফলভাবে ডিলিট হয়েছে' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
};
exports.default = deleteAccount;
