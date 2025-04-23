"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const manageUser = async (req, res) => {
    try {
        const { userId, action } = req.body;
        const role = req.role;
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "ইউজার খুঁজে পাওয়া যায়নি"
            });
            return;
        }
        let permission = false;
        if (role === "superAdmin") {
            permission = true;
        }
        else if (role === "admin") {
            permission = user.role === "user" || user.role === "moderator";
        }
        else if (role === "moderator") {
            permission = user.role === "user";
        }
        if (!permission) {
            res.status(403).json({
                success: false,
                message: "আপনার অনুমতি নেই"
            });
            return;
        }
        if (action === "delete") {
            await user.deleteOne();
            res.status(200).json({
                success: true,
                message: `${user.fullName} কে মোছা হয়েছে`
            });
            return;
        }
        if (action === "block") {
            user.isBanned = true;
        }
        if (action === "unblock") {
            user.isBanned = false;
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: `${user.fullName} কে ${action === "block" ? "বন্ধ করা হয়েছে" : "আনবন্ধ করা হয়েছে"}`
        });
    }
    catch (error) {
        console.error("Error in manageUser:", error);
        res.status(500).json({
            success: false,
            message: "সার্ভার ত্রুটি হয়েছে"
        });
    }
};
exports.default = manageUser;
