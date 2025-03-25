import { Request, Response } from "express";
import encryptPass from "../../handler/validation/encryptPass";
import userModel from "../../models/user/userSchema";
import generateJwt from "../../handler/validation/generateJwt";

const createUser = async (req: Request, res: Response): Promise<void> => {
    const data = JSON.parse(req.body.userData)
    const imageUrl = res.locals.imageUrl
    data.profileImageUrl = imageUrl
    data.role = "user"
    try {
        const encryptedPassword = await encryptPass(data.password)
        data.password = encryptedPassword

        const user = await userModel.create(data)
        
        const token = generateJwt(user.phone, user._id, user.role)
        res.status(201).json({ message: "Registeration successful", user, token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "User creation failed", error })
    }
};

export default createUser;