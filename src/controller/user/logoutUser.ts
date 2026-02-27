import { Request, Response } from "express";
import removeActiveUser from "../../handler/user/removeActiveUser";
import userModel from "../../models/user/userSchema";


const logoutUser = async(req: Request, res: Response): Promise<void> => {
        const { _id } = (req as any).user
        await removeActiveUser(_id);
        await userModel.findByIdAndUpdate(_id, {token: null});

        // Clear the token cookie from the browser
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        res.status(200).json({success: true, message: "লগ আউট সম্পন্ন হয়েছে"});
}

export default logoutUser;