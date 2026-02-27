"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const verifyPass_1 = __importDefault(require("../../handler/validation/verifyPass"));
const encryptPass_1 = __importDefault(require("../../handler/validation/encryptPass"));
const changePassword = async (req, res) => {
    try {
        const userRequest = req;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'বর্তমান এবং নতুন পাসওয়ার্ড দিন' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
            return;
        }
        const user = await userSchema_1.default.findById(userRequest.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }
        const isPasswordValid = await (0, verifyPass_1.default)(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'বর্তমান পাসওয়ার্ড ভুল' });
            return;
        }
        const hashedPassword = await (0, encryptPass_1.default)(newPassword);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
};
exports.default = changePassword;
