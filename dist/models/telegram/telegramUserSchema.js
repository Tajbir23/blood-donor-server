"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TelegramUserSchema = new mongoose_1.Schema({
    chatId: { type: String, required: true, unique: true },
    username: { type: String, default: null },
    firstName: { type: String, default: null },
    fullName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    divisionId: { type: String, required: true },
    districtId: { type: String, required: true },
    thanaId: { type: String, required: true },
    latitude: { type: Number, required: true, default: 0 },
    longitude: { type: Number, required: true, default: 0 },
    location: {
        type: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
        },
        default: { type: "Point", coordinates: [0, 0] },
    },
    lastDonationDate: { type: Date, default: null },
}, { timestamps: true });
TelegramUserSchema.index({ location: "2dsphere" });
const TelegramUserModel = mongoose_1.default.model("TelegramUser", TelegramUserSchema);
exports.default = TelegramUserModel;
