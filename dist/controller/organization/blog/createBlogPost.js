"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const createBlogPost = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const userId = req.user._id;
        const { title, content } = req.body;
        const imageUrls = res.locals.blogImageUrls || [];
        if (!title || !title.trim()) {
            res.status(400).json({ success: false, message: "ব্লগের শিরোনাম প্রদান করুন" });
            return;
        }
        if (!content || !content.trim()) {
            res.status(400).json({ success: false, message: "ব্লগের বিষয়বস্তু প্রদান করুন" });
            return;
        }
        const blogPost = await blogPostSchema_1.default.create({
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
    }
    catch (error) {
        console.error("Create blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট তৈরি করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = createBlogPost;
