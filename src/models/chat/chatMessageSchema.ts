import { model, Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
    ticketId: Schema.Types.ObjectId;
    senderType: "guest" | "admin";
    senderName: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
    {
        ticketId: {
            type: Schema.Types.ObjectId,
            ref: "ChatTicket",
            required: true,
            index: true,
        },
        senderType: {
            type: String,
            enum: ["guest", "admin"],
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

const ChatMessage = model<IChatMessage>("ChatMessage", chatMessageSchema);
export default ChatMessage;
