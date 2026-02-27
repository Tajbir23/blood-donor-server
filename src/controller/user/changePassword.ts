import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import verifyPass from "../../handler/validation/verifyPass";
import encryptPass from "../../handler/validation/encryptPass";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRequest = req as UserRequest;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'বর্তমান এবং নতুন পাসওয়ার্ড দিন' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
            return;
        }

        const user = await userModel.findById(userRequest.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }

        const isPasswordValid = await verifyPass(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'বর্তমান পাসওয়ার্ড ভুল' });
            return;
        }

        const hashedPassword = await encryptPass(newPassword);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
}

export default changePassword;
