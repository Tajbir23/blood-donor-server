"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const sendEmail_1 = __importDefault(require("../email/sendEmail"));
const encryptPass_1 = __importDefault(require("../../handler/validation/encryptPass"));
const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const plainPassword = generateRandomPassword();
        const hashedPassword = await (0, encryptPass_1.default)(plainPassword);
        const user = await userSchema_1.default.findOneAndUpdate({ email }, { password: hashedPassword });
        if (!user || !user.email || !user.fullName) {
            res.status(404).json({ success: false, message: 'আপনার ইমেইলটি ভূল' });
            return;
        }
        const templateData = {
            name: user.fullName,
            newPassword: plainPassword
        };
        const data = {
            email: user.email,
            subject: 'আপনার নতুন পাসওয়ার্ড',
            templateType: 'forgot-password',
            templateData
        };
        await (0, sendEmail_1.default)(data);
        res.status(200).json({ success: true, message: 'আপনার ইমেইলে নতুন পাসওয়ার্ড পাঠান হয়েছে' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার সমস্যা', error });
    }
};
exports.default = forgotPassword;
