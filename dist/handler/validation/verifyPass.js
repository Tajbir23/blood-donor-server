"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// Verify password function
const verifyPass = async (password, hashedPassword) => {
    try {
        // Compare the password with the hashed password
        const match = await bcrypt_1.default.compare(password, hashedPassword);
        if (match) {
            console.log('Password is correct');
            return true;
        }
        else {
            console.log('Password is incorrect');
            return false;
        }
    }
    catch (error) {
        console.error('Error verifying password:', error);
    }
};
exports.default = verifyPass;
