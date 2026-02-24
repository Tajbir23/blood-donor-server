import { model, Schema } from "mongoose";

export interface IBlogPost {
    _id: Schema.Types.ObjectId;
    organizationId: Schema.Types.ObjectId;
    authorId: Schema.Types.ObjectId;
    title: string;
    content: string;
    images: string[];
    isPublished: boolean;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
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

const blogPostModel = model<IBlogPost>("BlogPost", blogPostSchema);
export default blogPostModel;
