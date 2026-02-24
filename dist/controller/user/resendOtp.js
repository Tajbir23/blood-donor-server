"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendOtp_1 = __importDefault(require("./sendOtp"));
const resendOtp = async (req, res) => {
    var _a;
    const { email } = req.body;
    try {
        const result = await (0, sendOtp_1.default)(email);
        if (!(result === null || result === void 0 ? void 0 : result.success)) {
            res.status(500).json({ success: false, message: (_a = result === null || result === void 0 ? void 0 : result.message) !== null && _a !== void 0 ? _a : 'OTP পুনরায় পাঠাতে ব্যর্থ হয়েছে' });
            return;
        }
        res.status(200).json({ success: true, message: "OTP পুনরায় পাঠানো হয়েছে" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "OTP পুনরায় পাঠাতে ব্যর্থ হয়েছে" });
    }
};
exports.default = resendOtp;
