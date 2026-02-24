"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const getOrgBlogPosts = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            blogPostSchema_1.default.find({ organizationId })
                .populate('authorId', 'fullName profileImageUrl')
                .populate('organizationId', 'organizationName logoImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            blogPostSchema_1.default.countDocuments({ organizationId })
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
        console.error("Get org blog posts error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট লোড করতে ব্যর্থ হয়েছে" });
    }
};
exports.default = getOrgBlogPosts;
