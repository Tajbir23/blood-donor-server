import mongoose, { Schema, Document } from "mongoose";

export type MatchType = "exact" | "contains" | "startsWith" | "regex";
export type Platform  = "all" | "telegram" | "facebook";

export interface IBotCustomRule extends Document {
    trigger:     string;     // e.g. "রক্তের দাম কত"
    response:    string;     // The full reply text
    matchType:   MatchType;  // How to match the trigger
    platform:    Platform;   // Which platform(s) it applies to
    isActive:    boolean;
    addedBy:     string;
    createdAt:   Date;
    updatedAt:   Date;
}

const BotCustomRuleSchema = new Schema<IBotCustomRule>(
    {
        trigger:   { type: String, required: true, trim: true },
        response:  { type: String, required: true, trim: true },
        matchType: { type: String, enum: ["exact", "contains", "startsWith", "regex"], default: "contains" },
        platform:  { type: String, enum: ["all", "telegram", "facebook"], default: "all" },
        isActive:  { type: Boolean, default: true },
        addedBy:   { type: String, required: true },
    },
    { timestamps: true }
);

// Index for fast lookup
BotCustomRuleSchema.index({ isActive: 1, platform: 1 });

const BotCustomRuleModel = mongoose.model<IBotCustomRule>("BotCustomRule", BotCustomRuleSchema);
export default BotCustomRuleModel;
