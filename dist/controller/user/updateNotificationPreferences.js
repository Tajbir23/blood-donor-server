"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const updateNotificationPreferences = async (req, res) => {
    try {
        const userRequest = req;
        const { bloodRequestNotification, emailNotification } = req.body;
        const updateData = {};
        if (bloodRequestNotification !== undefined) {
            updateData['notificationPreferences.bloodRequestNotification'] = bloodRequestNotification;
        }
        if (emailNotification !== undefined) {
            updateData['notificationPreferences.emailNotification'] = emailNotification;
        }
        const user = await userSchema_1.default.findByIdAndUpdate(userRequest.user._id, { $set: updateData }, { new: true }).select('notificationPreferences');
        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'নোটিফিকেশন সেটিংস আপডেট হয়েছে',
            notificationPreferences: user.notificationPreferences
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
};
exports.default = updateNotificationPreferences;
