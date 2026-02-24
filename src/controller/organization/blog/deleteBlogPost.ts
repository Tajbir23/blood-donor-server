import { Request, Response } from "express";
import blogPostModel from "../../../models/organization/blogPostSchema";
import path from "path";
import fs from "fs";

const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;
        const userId = (req as any).user._id;

        const post = await blogPostModel.findById(blogId);
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
                    const filePath = path.join(process.cwd(), 'uploads', filename);
                    if (fs.existsSync(filePath)) {
                        await fs.promises.unlink(filePath);
                    }
                }
            } catch {
                // Ignore deletion errors
            }
        }

        await blogPostModel.findByIdAndDelete(blogId);

        res.status(200).json({ success: true, message: "ব্লগ পোস্ট সফলভাবে মুছে ফেলা হয়েছে" });
    } catch (error) {
        console.error("Delete blog post error:", error);
        res.status(500).json({ success: false, message: "ব্লগ পোস্ট মুছতে ব্যর্থ হয়েছে" });
    }
};

export default deleteBlogPost;
