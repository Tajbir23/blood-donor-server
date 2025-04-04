"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendOtp_1 = __importDefault(require("./sendOtp"));
const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await (0, sendOtp_1.default)(email);
        res.status(200).json({ success: true, message: "Otp resend successful" });
    }
    catch (error) {
        res.status(400).json({ success: false, message: "Otp resend failed", error });
    }
};
exports.default = resendOtp;
