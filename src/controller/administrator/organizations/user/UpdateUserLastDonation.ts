import { Request, Response } from "express"
import userModel from "../../../../models/user/userSchema"
import sendEmail from "../../../email/sendEmail"
import { createLogger } from "../../../../utils/logger";
import donationHistoryModel from "../../../../models/user/donationHistorySchema";

const logger = createLogger("updateUserLastDonation");
const updateUserLastDonation = async (req: Request, res: Response) => {
    const {lastDonationDate, userId, recipient, recipientName} = req.body
    try {
        const user = await userModel.findByIdAndUpdate(userId, {$set: {lastDonationDate}})

        if(!user) {
            res.status(404).json({success: false, message: "User not found"})
            return
        }
         // নতুন ৪ মাস পরের তারিখ সেট করা হচ্ছে
         const nextDonation = new Date(lastDonationDate);
         nextDonation.setMonth(nextDonation.getMonth() + 4);
 
         // ইউজারের lastDonationDate আপডেট করা হচ্ছে
         const newDonationCount = user.totalDonationCount + 1;
 
         const assignBadge = (donationCount: number): string | null => {
             if (donationCount === 1) return "প্রথম রক্তদান";
             if (donationCount === 5) return "নিয়মিত দাতা";
             if (donationCount === 10) return "জীবন রক্ষাকারী";
             return null;  // No new badge
         };

         const newBadge = assignBadge(newDonationCount);

         await userModel.findByIdAndUpdate(
            userId,
            {
                lastDonationDate,
                nextDonationDate: nextDonation,
                totalDonationCount: newDonationCount,
                ...(newBadge && { $push: { badges: newBadge } })
            },
            { new: true }
        );
        

        const donationHistory = await donationHistoryModel.create({ userId, donationDate: lastDonationDate, recipient: recipient ? recipient : "উল্লেখ নেই", recipientName: recipientName ? recipientName : "উল্লেখ নেই" });

        await donationHistory.save();

        const result = await sendEmail({
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
        } else {
            logger.error(`Failed to send next donation reminder to ${user.email}: ${result.message}`);
        }
        res.status(201).json({success: true, message: "Last donation updated"})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Internal server error"})
    }
}

export default updateUserLastDonation
