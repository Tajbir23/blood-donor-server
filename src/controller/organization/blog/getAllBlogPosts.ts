import { Request, Response } from "express";
import blogPostModel from "../../../models/organization/blogPostSchema";

const getAllBlogPosts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const search = (req.query.search as string) || '';
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = { isPublished: true };
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const [posts, total] = await Promise.all([
            blogPostModel.find(query)
                .populate('authorId', 'fullName profileImageUrl')
                .populate('organizationId', 'organizationName logoImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            blogPostModel.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            posts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Get all blog posts error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};

export default getAllBlogPosts;
