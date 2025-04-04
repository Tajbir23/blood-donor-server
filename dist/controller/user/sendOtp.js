"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = exports.otpMap = void 0;
const sendEmail_1 = __importDefault(require("../email/sendEmail"));
exports.otpMap = new Map();
const generateOTP = async (email) => {
    exports.otpMap.delete(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    exports.otpMap.set(email, otp);
    return otp;
};
exports.generateOTP = generateOTP;
const sendOtp = async (email) => {
    const otp = await (0, exports.generateOTP)(email);
    const data = await (0, sendEmail_1.default)({ email, subject: "Verify Email", templateType: "verifyEmail", templateData: { otp: otp } });
    return data;
};
exports.default = sendOtp;
