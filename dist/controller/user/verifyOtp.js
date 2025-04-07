"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendOtp_1 = require("./sendOtp");
const createUser_1 = require("./createUser");
const verifyOtp = async (req, res) => {
    const { email, otp, otpType } = req.body;
    const otpData = await sendOtp_1.otpMap.get(email);
    if (otpData === otp) {
        if (otpType === "register") {
            await (0, createUser_1.resRegUser)(email, res);
        }
    }
    else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
};
exports.default = verifyOtp;
