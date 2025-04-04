"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const orgJoinRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { organizationId } = req.params;
        const existingRequest = await orgJoinRequestSchema_1.default.findOne({ organizationId, userId, status: "pending" });
        if (existingRequest) {
            res.status(400).json({ message: "আপনি ইতোমধ্যে যোগদান এর জন্য আবেদন করেছেন। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
            return;
        }
        const newJoinRequest = new orgJoinRequestSchema_1.default({
            organizationId,
            userId
        });
        await newJoinRequest.save();
        res.status(200).json({ message: "আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে। আপনার আবেদন অনুমোদিত হওয়া পর্যন্ত অপেক্ষা করুন।" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.default = orgJoinRequest;
