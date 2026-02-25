import { Schema, model, Document } from "mongoose";

export interface ITelegramMessage extends Document {
    chatId: string;
    username?: string;
    firstName?: string;
    messageText?: string;
    callbackData?: string;
    direction: "incoming" | "outgoing";
    rawPayload?: object;
    createdAt: Date;
}

const telegramMessageSchema = new Schema<ITelegramMessage>(
    {
        chatId:       { type: String, required: true, index: true },
        username:     { type: String, default: null },
        firstName:    { type: String, default: null },
        messageText:  { type: String, default: null },
        callbackData: { type: String, default: null },
        direction:    { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
        rawPayload:   { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true }
);

const TelegramMessage = model<ITelegramMessage>("TelegramMessage", telegramMessageSchema);
export default TelegramMessage;
