import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import verifyPass from "../../handler/validation/verifyPass";

interface UserRequest extends Request {
    user: {
        _id: string;
    }
}

const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userRequest = req as UserRequest;
        const { password } = req.body;

        if (!password) {
            res.status(400).json({ success: false, message: 'অ্যাকাউন্ট ডিলিট করতে পাসওয়ার্ড দিন' });
            return;
        }

        const user = await userModel.findById(userRequest.user._id);
        if (!user) {
            res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি' });
            return;
        }

        const isPasswordValid = await verifyPass(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: 'পাসওয়ার্ড ভুল হয়েছে' });
            return;
        }

        await userModel.findByIdAndDelete(userRequest.user._id);

        res.clearCookie("token");
        res.status(200).json({ success: true, message: 'অ্যাকাউন্ট সফলভাবে ডিলিট হয়েছে' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'সার্ভার ত্রুটি', error });
    }
}

export default deleteAccount;
