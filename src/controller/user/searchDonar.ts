import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";

const searchDonar = async (req: Request, res: Response) => {
    const {search = ""} = req.query;
    const donors = await userModel.find({
        $or: [
            { fullName: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { _id: search.toString().match(/^[0-9a-fA-F]{24}$/) ? search : null }
        ],
        isBanned: { $ne: true },
        isActive: true,
        isVerified: true,
    }).select("-password -fingerPrint -location -token").limit(5);

    res.status(200).json({ success: true, donors });
}

export default searchDonar;
