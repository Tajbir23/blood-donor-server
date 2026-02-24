"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// Verify password function
const verifyPass = async (password, hashedPassword) => {
    try {
        const match = await bcrypt_1.default.compare(password, hashedPassword);
        return match;
    }
    catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};
exports.default = verifyPass;
