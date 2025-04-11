"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const donationHistorySchema_1 = __importDefault(require("../../models/user/donationHistorySchema"));
const sendEmail_1 = __importDefault(require("../email/sendEmail"));
const logger_1 = require("../../utils/logger");
const logger = (0, logger_1.createLogger)("updateLastDonation");
const updateLastDonation = async (req, res) => {
    const userId = req.user._id;
    const { lastDonation, recipient, recipientName } = req.body;
    try {
        // ডাটাবেজ থেকে ইউজারের তথ্য আনো
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            console.log("updateLastDonation.ts", 401);
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const currentDate = new Date();
        const lastDonationDate = user.lastDonationDate ? new Date(user.lastDonationDate) : null;
        // চেক করা হচ্ছে, শেষ রক্তদান ৪ মাসের বেশি আগে হয়েছে কিনা বা null আছে কিনা
        if (lastDonationDate && (currentDate.getTime() - lastDonationDate.getTime()) < 120 * 24 * 60 * 60 * 1000) {
            res.status(400).json({ success: false, message: "আপনি শুধু ৪ মাস পরের রক্তদানের জন্য রক্তদান করতে পারবেন।" });
            return;
        }
        // নতুন ৪ মাস পরের তারিখ সেট করা হচ্ছে
        const nextDonation = new Date(lastDonation);
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
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, {
            lastDonationDate: lastDonation,
            nextDonationDate: nextDonation,
            totalDonationCount: newDonationCount,
            ...(newBadge && { $push: { badges: newBadge } })
        }, { new: true });
        const donationHistory = await donationHistorySchema_1.default.create({ userId, donationDate: lastDonation, recipient: recipient ? recipient : "উল্লেখ নেই", recipientName: recipientName ? recipientName : "উল্লেখ নেই" });
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
        res.status(200).json({ success: true, message: "শেষ রক্তদান আপডেট হয়েছে", user: updatedUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "শেষ রক্তদান আপডেট করার সময় ত্রুটি দেখাচ্ছে।" });
    }
};
exports.default = updateLastDonation;
