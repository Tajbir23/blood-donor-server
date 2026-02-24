"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogCommentSchema_1 = __importDefault(require("../../../models/organization/blogCommentSchema"));
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const addBlogComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user._id;
        const { content } = req.body;
        if (!content || !content.trim()) {
            res.status(400).json({ success: false, message: "মন্তব্য লিখুন" });
            return;
        }
        const post = await blogPostSchema_1.default.findById(blogId);
        if (!post) {
            res.status(404).json({ success: false, message: "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি" });
            return;
        }
        const comment = await blogCommentSchema_1.default.create({
            blogPostId: blogId,
            userId,
            content: content.trim()
        });
        // Increment comment count
        await blogPostSchema_1.default.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });
        const populatedComment = await blogCommentSchema_1.default.findById(comment._id)
            .populate('userId', 'fullName profileImageUrl')
            .lean();
        res.status(201).json({
            success: true,
            message: "মন্তব্য সফলভাবে যোগ হয়েছে",
            comment: populatedComment
        });
    }
    catch (error) {
        console.error("Add blog comment error:", error);
        res.status(500).json({ success: false, message: "মন্তব্য যোগ করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = addBlogComment;
