"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const addMember = async (req, res) => {
    const { organizationId } = req.params;
    const { memberId } = req.body;
    try {
        console.log(memberId, organizationId);
        const alreadymember = await userSchema_1.default.findOne({ _id: memberId, organizationId });
        if (alreadymember) {
            res.status(201).json({ success: false, message: "Already joined" });
            return;
        }
        await userSchema_1.default.findByIdAndUpdate(memberId, { $push: { organizationId: organizationId } });
        res.status(201).json({ success: true, message: "Member added" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.default = addMember;
