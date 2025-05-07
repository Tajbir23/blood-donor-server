"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const generateJwt_1 = __importDefault(require("../../handler/validation/generateJwt"));
const refreshToken = async (req, res) => {
    const { token } = req.body;
    const user = await userSchema_1.default.findOne({ token });
    if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const newToken = (0, generateJwt_1.default)(user.phone, user._id, user.role, user.organizationId);
    user.token = newToken;
    await user.save();
    res.status(200).json({ refreshToken: newToken });
};
exports.default = refreshToken;
