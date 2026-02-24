import { Request, Response } from "express";
import blogCommentModel from "../../../models/organization/blogCommentSchema";
import blogPostModel from "../../../models/organization/blogPostSchema";

const addBlogComment = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        const userId = (req as any).user._id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ success: false, message: "মন্তব্য লিখুন" });
            return;
        }

        const post = await blogPostModel.findById(blogId);
        if (!post) {
            res.status(404).json({ success: false, message: "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি" });
            return;
        }

        const comment = await blogCommentModel.create({
            blogPostId: blogId,
            userId,
            content: content.trim()
        });

        // Increment comment count
        await blogPostModel.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

        const populatedComment = await blogCommentModel.findById(comment._id)
            .populate('userId', 'fullName profileImageUrl')
            .lean();

        res.status(201).json({
            success: true,
            message: "মন্তব্য সফলভাবে যোগ হয়েছে",
            comment: populatedComment
        });
    } catch (error) {
        console.error("Add blog comment error:", error);
        res.status(500).json({ success: false, message: "মন্তব্য যোগ করতে ব্যর্থ হয়েছে" });
    }
};

export default addBlogComment;
