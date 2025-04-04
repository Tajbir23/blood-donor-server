"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const findNearAvailableDonor = async (latitude, longitude) => {
    // Calculate date 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const fourMonthsAgoStr = fourMonthsAgo.toISOString().split('T')[0];
    const donors = await userSchema_1.default.find({
        isActive: true,
        canDonate: true,
        isVerified: true,
        isBanned: false,
        $or: [
            { lastDonationDate: null },
            { lastDonationDate: { $lt: fourMonthsAgoStr } }
        ],
        location: {
            $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 100000 }
        }
    });
    return donors;
};
exports.default = findNearAvailableDonor;
