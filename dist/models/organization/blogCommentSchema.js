"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogCommentSchema = new mongoose_1.Schema({
    blogPostId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "BlogPost",
        required: true,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });
blogCommentSchema.index({ blogPostId: 1, createdAt: -1 });
const blogCommentModel = (0, mongoose_1.model)("BlogComment", blogCommentSchema);
exports.default = blogCommentModel;
