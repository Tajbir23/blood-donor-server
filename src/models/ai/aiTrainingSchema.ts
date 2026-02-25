import mongoose, { Schema, Document } from "mongoose";
import { Intent } from "../../handler/facebookBotHandler/ai/trainingData";

export interface IAiTrainingEntry extends Document {
    questionText: string;
    answerText: string;
    intent: Intent;
    sourceMessageId?: string;
    sourcePlatform?: "telegram" | "facebook";
    addedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const AiTrainingSchema = new Schema<IAiTrainingEntry>(
    {
        questionText:    { type: String, required: true },
        answerText:      { type: String, required: true },
        intent:          { type: String, required: true },
        sourceMessageId: { type: String, default: null },
        sourcePlatform:  { type: String, enum: ["telegram", "facebook"], default: null },
        addedBy:         { type: String, required: true },
    },
    { timestamps: true }
);

const AiTrainingModel = mongoose.model<IAiTrainingEntry>("AiTraining", AiTrainingSchema);
export default AiTrainingModel;
