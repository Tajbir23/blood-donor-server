import { Request, Response } from "express";
import userModel from "../../models/user/userSchema";
import generateJwt from "../../handler/validation/generateJwt";

const refreshToken = async (req: Request, res: Response) => {
    const {token} = req.body;
    const user = await userModel.findOne({token});
    if(!user) {
        res.status(401).json({message: "Unauthorized"});
        return;
    }
    const newToken = generateJwt(user.phone, user._id, user.role, user.organizationId);
    user.token = newToken;
    await user.save();
    res.status(200).json({refreshToken: newToken});
}

export default refreshToken;
