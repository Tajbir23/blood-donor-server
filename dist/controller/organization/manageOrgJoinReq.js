"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orgJoinRequestSchema_1 = __importDefault(require("../../models/organization/orgJoinRequestSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const manageOrgJoinReq = async (req, res) => {
    const { organizationId } = req.params;
    const { orgJoinRequestId, status } = req.body;
    try {
        const data = await orgJoinRequestSchema_1.default.findByIdAndUpdate(orgJoinRequestId, { status }, { new: true });
        if (status === 'accepted') {
            const user = await userSchema_1.default.findById(data?.userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            if (!user.organizationId) {
                user.organizationId = [];
            }
            user.organizationId.push(organizationId);
            user.isVerified = true;
            await user.save();
            res.status(200).json({ message: "Organization join request accepted" });
            return;
        }
        else {
            res.status(200).json({ message: "Organization join request rejected" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ message: "Server error" });
    }
};
exports.default = manageOrgJoinReq;
