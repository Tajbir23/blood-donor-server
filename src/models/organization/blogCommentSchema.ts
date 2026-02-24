import { model, Schema } from "mongoose";

export interface IBlogComment {
    _id: Schema.Types.ObjectId;
    blogPostId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const blogCommentSchema = new Schema<IBlogComment>({
    blogPostId: {
        type: Schema.Types.ObjectId,
        ref: "BlogPost",
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
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

const blogCommentModel = model<IBlogComment>("BlogComment", blogCommentSchema);
export default blogCommentModel;
