"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connection = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donation', {
            // ─── Connection Pool Tuning ──────────────────────────────────
            maxPoolSize: 20, // সর্বোচ্চ 20 টি concurrent connection
            minPoolSize: 5, // সবসময় 5 টি connection ready থাকবে
            maxIdleTimeMS: 30000, // 30 সেকেন্ড idle থাকলে connection close
            serverSelectionTimeoutMS: 5000, // 5s এর মধ্যে server না পেলে error
            socketTimeoutMS: 45000, // 45s এর মধ্যে response না আসলে timeout
        });
        console.log('Connected to MongoDB (pool: 5-20)');
    }
    catch (err) {
        console.log('Error connecting to MongoDB', err);
    }
};
exports.default = connection;
