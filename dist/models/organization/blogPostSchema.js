"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogPostSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    commentCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ organizationId: 1, createdAt: -1 });
const blogPostModel = (0, mongoose_1.model)("BlogPost", blogPostSchema);
exports.default = blogPostModel;
