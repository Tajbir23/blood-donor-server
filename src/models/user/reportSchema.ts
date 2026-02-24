import { model, Schema } from "mongoose";

export interface IReport {
    reportedUserId: Schema.Types.ObjectId;
    reporterUserId: Schema.Types.ObjectId;
    organizationId?: Schema.Types.ObjectId;
    reason: string;
    category: 'fake_donation' | 'inappropriate_behavior' | 'spam' | 'wrong_info' | 'other';
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
    reportedUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reporterUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        default: null
    },
    reason: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['fake_donation', 'inappropriate_behavior', 'spam', 'wrong_info', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    }
}, { timestamps: true });

reportSchema.index({ organizationId: 1, status: 1 });
reportSchema.index({ reportedUserId: 1 });

const reportModel = model<IReport>("Report", reportSchema);
export default reportModel;
