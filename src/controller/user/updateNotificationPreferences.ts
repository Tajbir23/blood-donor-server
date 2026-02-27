import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRequest = req as UserRequest;
        const { bloodRequestNotification, emailNotification } = req.body;

        const updateData: Record<string, boolean> = {};

        if (bloodRequestNotification !== undefined) {
            updateData['notificationPreferences.bloodRequestNotification'] = bloodRequestNotification;
        }
        if (emailNotification !== undefined) {
            updateData['notificationPreferences.emailNotification'] = emailNotification;
        }

        const user = await userModel.findByIdAndUpdate(
            userRequest.user._id,
            { $set: updateData },
            { new: true }
        ).select('notificationPreferences');

        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }

        res.status(200).json({ 
            success: true, 
            message: 'নোটিফিকেশন সেটিংস আপডেট হয়েছে',
            notificationPreferences: user.notificationPreferences 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
}

export default updateNotificationPreferences;
