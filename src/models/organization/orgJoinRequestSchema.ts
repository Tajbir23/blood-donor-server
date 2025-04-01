import { model, Schema } from "mongoose";
import { orJoinRequestType } from "../../types/organizationType";

const orgJoinRequestSchema = new Schema<orJoinRequestType>({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true })

const orgJoinRequestModel = model<orJoinRequestType>("OrgJoinRequest", orgJoinRequestSchema)
export default orgJoinRequestModel;