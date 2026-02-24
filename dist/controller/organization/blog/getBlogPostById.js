"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const blogCommentSchema_1 = __importDefault(require("../../../models/organization/blogCommentSchema"));
const getBlogPostById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const post = await blogPostSchema_1.default.findById(blogId)
            .populate('authorId', 'fullName profileImageUrl')
            .populate('organizationId', 'organizationName logoImage organizationType')
            .lean();
        if (!post) {
            res.status(404).json({ success: false, message: "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি" });
            return;
        }
        // Get comments
        const comments = await blogCommentSchema_1.default.find({ blogPostId: blogId })
            .populate('userId', 'fullName profileImageUrl')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.status(200).json({
            success: true,
            post,
            comments
        });
    }
    catch (error) {
        console.error("Get blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = getBlogPostById;
