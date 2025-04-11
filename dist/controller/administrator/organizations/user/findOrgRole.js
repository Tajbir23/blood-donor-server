"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const organizationSchema_1 = __importDefault(require("../../../../models/organization/organizationSchema"));
const findOrgRole = async (userId) => {
    console.log("userId", userId);
    const organizations = await organizationSchema_1.default.find({
        $or: [
            { owner: new mongoose_1.Types.ObjectId(userId) },
            { admins: new mongoose_1.Types.ObjectId(userId) },
            { moderators: new mongoose_1.Types.ObjectId(userId) },
            { superAdmins: new mongoose_1.Types.ObjectId(userId) }
        ],
        isActive: true,
        isBanned: false
    });
    console.log("organizations", organizations);
    if (organizations.length === 0) {
        return { isAdmin: false };
    }
    const data = await organizations.map(org => {
        let role = null;
        if (org.owner.toString() === userId) {
            role = "owner";
        }
        else if (org.admins.map(id => id.toString()).includes(userId)) {
            role = "admin";
        }
        else if (org.superAdmins.map(id => id.toString()).includes(userId)) {
            role = "superAdmin";
        }
        else if (org.moderators.map(id => id.toString()).includes(userId)) {
            role = "moderator";
        }
        return { organizationId: org._id, role };
    });
    console.log("result", data);
    return { data, isAdmin: true };
};
exports.default = findOrgRole;
