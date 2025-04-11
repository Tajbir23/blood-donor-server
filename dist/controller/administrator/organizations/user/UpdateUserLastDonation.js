"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const sendEmail_1 = __importDefault(require("../../../email/sendEmail"));
const logger_1 = require("../../../../utils/logger");
const donationHistorySchema_1 = __importDefault(require("../../../../models/user/donationHistorySchema"));
const logger = (0, logger_1.createLogger)("updateUserLastDonation");
const updateUserLastDonation = async (req, res) => {
    const { lastDonationDate, userId, recipient, recipientName } = req.body;
    try {
        const user = await userSchema_1.default.findByIdAndUpdate(userId, { $set: { lastDonationDate } });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // নতুন ৪ মাস পরের তারিখ সেট করা হচ্ছে
        const nextDonation = new Date(lastDonationDate);
        nextDonation.setMonth(nextDonation.getMonth() + 4);
        // ইউজারের lastDonationDate আপডেট করা হচ্ছে
        const newDonationCount = user.totalDonationCount + 1;
        const assignBadge = (donationCount) => {
            if (donationCount === 1)
                return "প্রথম রক্তদান";
            if (donationCount === 5)
                return "নিয়মিত দাতা";
            if (donationCount === 10)
                return "জীবন রক্ষাকারী";
            return null; // No new badge
        };
        const newBadge = assignBadge(newDonationCount);
        await userSchema_1.default.findByIdAndUpdate(userId, {
            lastDonationDate,
            nextDonationDate: nextDonation,
            totalDonationCount: newDonationCount,
            ...(newBadge && { $push: { badges: newBadge } })
        }, { new: true });
        const donationHistory = await donationHistorySchema_1.default.create({ userId, donationDate: lastDonationDate, recipient: recipient ? recipient : "উল্লেখ নেই", recipientName: recipientName ? recipientName : "উল্লেখ নেই" });
        await donationHistory.save();
        const result = await (0, sendEmail_1.default)({
            email: user.email,
            subject: "আপনার পরবর্তী রক্তদানের তারিখ",
            templateType: "nextDonationReminder",
            templateData: {
                name: user.fullName,
                nextDonationDate: nextDonation.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
                donationLink: `${process.env.FRONTEND_URL}/blood-donation`,
            }
        });
        if (result.success) {
            logger.info(`Sent next donation reminder to ${user.email} ${result.message} `);
        }
        else {
            logger.error(`Failed to send next donation reminder to ${user.email}: ${result.message}`);
        }
        res.status(201).json({ success: true, message: "Last donation updated" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = updateUserLastDonation;
