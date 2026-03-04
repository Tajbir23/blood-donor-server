import { model, Schema, Document } from "mongoose";

export interface IChatTicket extends Document {
    guestId: string;           // UUID generated on client (stored in localStorage)
    guestName: string;         // optional name the visitor gives
    status: "open" | "closed";
    assignedTo?: Schema.Types.ObjectId; // admin / moderator user
    lastMessageAt: Date;
    expiresAt: Date;           // TTL — auto-delete after this time
    createdAt: Date;
    updatedAt: Date;
}

const chatTicketSchema = new Schema<IChatTicket>(
    {
        guestId: {
            type: String,
            required: true,
            index: true,
        },
        guestName: {
            type: String,
            default: "অতিথি",
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            index: { expires: 0 }, // MongoDB TTL index — auto deletes at expiresAt
        },
    },
    { timestamps: true }
);

const ChatTicket = model<IChatTicket>("ChatTicket", chatTicketSchema);
export default ChatTicket;
