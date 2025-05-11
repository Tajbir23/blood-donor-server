"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const botBaseUrl_1 = __importDefault(require("./botBaseUrl"));
const registerHandler = async (psId, title, replies) => {
    const user = await userSchema_1.default.findOne({ fbId: psId });
    if (!user) {
        await axios.post(botBaseUrl_1.default, {
            recipient: { id: psId },
            message: {
                text: "You are already registered"
            }
        });
        return;
    }
    // register user in database
};
exports.default = registerHandler;
