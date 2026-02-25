import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramUser extends Document {
    chatId: string;
    username?: string;
    firstName?: string;
    fullName: string;
    phoneNumber: string;
    bloodGroup: string;
    divisionId: string;
    districtId: string;
    thanaId: string;
    latitude: number;
    longitude: number;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    lastDonationDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const GeoPointSchema = new Schema(
    {
        type:        { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
    },
    { _id: false }
);

const TelegramUserSchema = new Schema<ITelegramUser>(
    {
        chatId:     { type: String, required: true, unique: true },
        username:   { type: String, default: null },
        firstName:  { type: String, default: null },
        fullName:   { type: String, required: true },
        phoneNumber: { type: String, required: true, default: "" },
        bloodGroup: { type: String, required: true },
        divisionId: { type: String, required: true },
        districtId: { type: String, required: true },
        thanaId:    { type: String, required: true },
        latitude:   { type: Number, required: true, default: 0 },
        longitude:  { type: Number, required: true, default: 0 },
        location:   { type: GeoPointSchema, default: () => ({ type: "Point", coordinates: [0, 0] }) },
        lastDonationDate: { type: Date, default: null },
    },
    { timestamps: true }
);

TelegramUserSchema.index({ location: "2dsphere" });

const TelegramUserModel = mongoose.model<ITelegramUser>("TelegramUser", TelegramUserSchema);

export default TelegramUserModel;
