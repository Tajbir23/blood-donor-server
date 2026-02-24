"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const getAllBlogPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        const query = { isPublished: true };
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        const [posts, total] = await Promise.all([
            blogPostSchema_1.default.find(query)
                .populate('authorId', 'fullName profileImageUrl')
                .populate('organizationId', 'organizationName logoImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            blogPostSchema_1.default.countDocuments(query)
        ]);
        res.status(200).json({
            success: true,
            posts,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    }
    catch (error) {
        console.error("Get all blog posts error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = getAllBlogPosts;
