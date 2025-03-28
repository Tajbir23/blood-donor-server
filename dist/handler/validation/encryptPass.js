"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const encryptPass = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    const hash = await bcrypt_1.default.hash(password, salt);
    return hash;
};
exports.default = encryptPass;
