"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const updateProfileImage = async (req, res) => {
    const { _id } = req.user;
    const { imageUrl } = res.locals;
    try {
        await userSchema_1.default.findByIdAndUpdate(_id, { profileImageUrl: imageUrl });
        res.status(201).json({ success: true, message: "Profile image updated" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.default = updateProfileImage;
