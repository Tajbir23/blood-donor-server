"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../../../models/user/userSchema"));
const roleChangeUser = async (req, res) => {
    const { userId, newRole } = req.body;
    const adminRole = req.role;
    let isPermission = false;
    if (adminRole === "moderator") {
        res.status(403).json({
            success: false,
            message: "আপনার রোল পরিবর্তন করার অনুমতি নেই"
        });
        return;
    }
    if (adminRole === "superAdmin")
        isPermission = true;
    if (adminRole === "admin" && newRole === "moderator")
        isPermission = true;
    if (isPermission) {
        try {
            if (adminRole === "superAdmin") {
                await userSchema_1.default.findByIdAndUpdate(userId, { role: newRole });
                await userSchema_1.default.findOneAndUpdate({ role: "superAdmin" }, { role: "admin" });
                res.status(200).json({
                    success: true,
                    message: "রোল পরিবর্তন সফলভাবে হয়েছে"
                });
                return;
            }
            if (adminRole === "admin") {
                await userSchema_1.default.findByIdAndUpdate(userId, { role: newRole });
                res.status(200).json({
                    success: true,
                    message: "রোল পরিবর্তন সফলভাবে হয়েছে"
                });
                return;
            }
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "রোল পরিবর্তন সফলভাবে হয়নি"
            });
            return;
        }
    }
    else {
        res.status(403).json({
            success: false,
            message: "আপনার রোল পরিবর্তন করার অনুমতি নেই"
        });
        return;
    }
};
exports.default = roleChangeUser;
