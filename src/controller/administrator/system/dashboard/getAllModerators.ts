import { Request, Response } from "express";
import userModel from "../../../../models/user/userSchema";

const getAllModerators = async (req: Request, res: Response) => {
  const { page, limit, search } = req.query;
  const role = (req as any).role;
  const pageNumber = parseInt(page as string) || 1;
  const limitNumber = parseInt(limit as string) || 10;

  if (role !== "admin" && role !== "superAdmin") {
    res.status(403).json({ message: "You are not authorized to access this page" });
    return;
  }

  try {
    const query: any = { role: "moderator" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    const moderators = await userModel.find(query).skip((pageNumber - 1) * limitNumber).limit(limitNumber);
    const total = await userModel.countDocuments(query);
    const totalPages = Math.ceil(total / limitNumber);
    res.status(200).json({ users: moderators, totalPages, totalUsers: total });
  } catch (error) {
    res.status(500).json({ message: "Error fetching moderators" });
  }
};

export default getAllModerators;
