"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connection = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donation');
        console.log('Connected to MongoDB');
    }
    catch (err) {
        console.log('Error connecting to MongoDB', err);
    }
};
exports.default = connection;
