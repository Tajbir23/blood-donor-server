"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../../../models/organization/orgJoinRequestSchema"));
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const manageOrgJoinReq = async (req, res) => {
    const { organizationId } = req.params;
    const { userId, status } = req.body;
    console.log("organizationId", organizationId, "orgJoinReq", userId, "status", status);
    try {
        if (status === 'accepted') {
            const user = await userSchema_1.default.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            await userSchema_1.default.updateOne({ _id: userId }, { $push: { organizationId: organizationId } });
            await orgJoinRequestSchema_1.default.updateOne({ userId, organizationId }, { status });
            res.status(200).json({ success: true, message: "Organization join request accepted" });
            return;
        }
        else {
            await orgJoinRequestSchema_1.default.deleteOne({ userId, organizationId });
            res.status(200).json({ success: true, message: "Organization join request rejected" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ success: false, message: "Server error" });
    }
};
exports.default = manageOrgJoinReq;
