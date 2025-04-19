"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const removeUser = async (req, res) => {
    const { organizationId } = req.params;
    const { userId } = req.body;
    try {
        const user = await userSchema_1.default.findByIdAndUpdate(userId, { $pull: { organizationId } });
        res.status(201).json({ success: true, message: `${user === null || user === void 0 ? void 0 : user.fullName} remove from organization` });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ success: false, message: "Internal server error" });
    }
};
exports.default = removeUser;
