import { Schema, model, Document } from "mongoose";

export interface IFacebookMessage extends Document {
    psId: string;
    messageText?: string;
    postback?: string;
    quickReplyPayload?: string;
    direction: "incoming" | "outgoing";
    rawPayload?: object;
    botReply?: string;
    createdAt: Date;
}

const facebookMessageSchema = new Schema<IFacebookMessage>(
    {
        psId: { type: String, required: true, index: true },
        messageText: { type: String, default: null },
        postback: { type: String, default: null },
        quickReplyPayload: { type: String, default: null },
        direction: { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
        rawPayload: { type: Schema.Types.Mixed, default: null },
        botReply: { type: String, default: null },
    },
    { timestamps: true }
);

const FacebookMessage = model<IFacebookMessage>("FacebookMessage", facebookMessageSchema);

export default FacebookMessage;
