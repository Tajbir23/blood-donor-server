import { Request, Response } from "express";
import removeActiveUser from "../../handler/user/removeActiveUser";


const logoutUser = async(req: Request, res: Response): Promise<void> => {
    
        const { _id } = (req as any).user
        removeActiveUser(_id);
        res.status(200).json({success: true, message: "লগ আউট সম্পন্ন হয়েছে"});
    
}

export default logoutUser;