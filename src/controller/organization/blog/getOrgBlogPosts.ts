import { Request, Response } from "express";
import blogPostModel from "../../../models/organization/blogPostSchema";

const getOrgBlogPosts = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            blogPostModel.find({ organizationId })
                .populate('authorId', 'fullName profileImageUrl')
                .populate('organizationId', 'organizationName logoImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            blogPostModel.countDocuments({ organizationId })
        ]);

        res.status(200).json({
            success: true,
            posts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Get org blog posts error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};

export default getOrgBlogPosts;
