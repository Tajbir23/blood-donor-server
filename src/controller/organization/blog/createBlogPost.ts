import { Request, Response } from "express";
import blogPostModel from "../../../models/organization/blogPostSchema";

const createBlogPost = async (req: Request, res: Response) => {
    try {
        const { organizationId } = req.params;
        const userId = (req as any).user._id;
        const { title, content } = req.body;
        const imageUrls: string[] = res.locals.blogImageUrls || [];

        if (!title || !title.trim()) {
            res.status(400).json({ success: false, message: "ব্লগের শিরোনাম প্রদান করুন" });
            return;
        }

        if (!content || !content.trim()) {
            res.status(400).json({ success: false, message: "ব্লগের বিষয়বস্তু প্রদান করুন" });
            return;
        }

        const blogPost = await blogPostModel.create({
            organizationId,
            authorId: userId,
            title: title.trim(),
            content: content.trim(),
            images: imageUrls,
            isPublished: true
        });

        res.status(201).json({
            success: true,
            message: "ব্লগ পোস্ট সফলভাবে প্রকাশিত হয়েছে",
            blogPost
        });
    } catch (error) {
        console.error("Create blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট তৈরি করতে ব্যর্থ হয়েছে" });
    }
};

export default createBlogPost;
