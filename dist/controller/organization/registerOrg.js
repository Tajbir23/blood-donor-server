"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const registerOrg = async (req, res) => {
    const organizationData = JSON.parse(req.body.organizationData);
    console.log(req.body);
    const user = req.user;
    const imageUrl = res.locals.imageUrl;
    try {
        const organization = await organizationSchema_1.default.create({
            ...organizationData,
            owner: user._id,
            logoImage: imageUrl
        });
        res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Organization creation failed",
            error
        });
    }
};
exports.default = registerOrg;
