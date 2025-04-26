"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../../../models/organization/organizationSchema"));
const updateOrgCover = async (req, res) => {
    const { organizationId } = req.params;
    const imageUrl = res.locals.imageUrl;
    try {
        const organization = await organizationSchema_1.default.findByIdAndUpdate(organizationId, { $set: { logoImage: imageUrl } });
        if (!organization) {
            res.status(404).json({ success: false, message: "Organization not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Organization cover image updated successfully" });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = updateOrgCover;
