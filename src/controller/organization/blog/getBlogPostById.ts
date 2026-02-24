import { Request, Response } from "express";
import blogPostModel from "../../../models/organization/blogPostSchema";
import blogCommentModel from "../../../models/organization/blogCommentSchema";

const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;

        const post = await blogPostModel.findById(blogId)
            .populate('authorId', 'fullName profileImageUrl')
            .populate('organizationId', 'organizationName logoImage organizationType')
            .lean();

        if (!post) {
            res.status(404).json({ success: false, message: "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি" });
            return;
        }

        // Get comments
        const comments = await blogCommentModel.find({ blogPostId: blogId })
            .populate('userId', 'fullName profileImageUrl')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.status(200).json({
            success: true,
            post,
            comments
        });
    } catch (error) {
        console.error("Get blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};

export default getBlogPostById;
