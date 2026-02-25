"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../../../models/organization/organizationSchema"));
const manageOrg = async (req, res) => {
    const { organizationId } = req.params;
    const { status } = req.body;
    console.log(req.body, organizationId, "calling it");
    const { role } = req.user;
    if (role !== 'admin' && role !== 'superAdmin') {
        res.status(403).json({ message: "You are not authorized to access this resource" });
        return;
    }
    try {
        const organization = await organizationSchema_1.default.findById(organizationId);
        console.log(organization, "organization");
        if (!organization) {
            res.status(404).json({ message: "Organization not found" });
            return;
        }
        if (status === 'active') {
            organization.isActive = true;
            organization.isBanned = false;
        }
        else if (status === 'ban') {
            organization.isActive = false;
            organization.isBanned = true;
        }
        else if (status === 'unban') {
            organization.isActive = true;
            organization.isBanned = false;
        }
        else if (status === 'delete') {
            await organizationSchema_1.default.findByIdAndDelete(organizationId);
        }
        await organization.save();
        res.status(200).json({ success: true, message: "Organization updated successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error updating organization", error });
    }
};
exports.default = manageOrg;
