"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogPostSchema_1 = __importDefault(require("../../../models/organization/blogPostSchema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteBlogPost = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user._id;
        const post = await blogPostSchema_1.default.findById(blogId);
        if (!post) {
            res.status(404).json({ success: false, message: "ব্লগ পোস্ট খুঁজে পাওয়া যায়নি" });
            return;
        }
        if (post.authorId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, message: "আপনি শুধুমাত্র নিজের পোস্ট মুছতে পারবেন" });
            return;
        }
        // Delete associated images
        for (const imageUrl of post.images) {
            try {
                const filename = imageUrl.split('/uploads/')[1];
                if (filename) {
                    const filePath = path_1.default.join(process.cwd(), 'uploads', filename);
                    if (fs_1.default.existsSync(filePath)) {
                        await fs_1.default.promises.unlink(filePath);
                    }
                }
            }
            catch (_a) {
                // Ignore deletion errors
            }
        }
        await blogPostSchema_1.default.findByIdAndDelete(blogId);
        res.status(200).json({ success: true, message: "ব্লগ পোস্ট সফলভাবে মুছে ফেলা হয়েছে" });
    }
    catch (error) {
        console.error("Delete blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট মুছতে ব্যর্থ হয়েছে" });
    }
};
exports.default = deleteBlogPost;
