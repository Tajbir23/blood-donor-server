"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationSchema_1 = __importDefault(require("../../models/organization/organizationSchema"));
const allOrganizations = async (req, res) => {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const query = {
        isActive: true,
        isBanned: false,
    };
    if (search && typeof search === 'string') {
        query.organizationName = { $regex: new RegExp(search, 'i') };
    }
    const organizations = await organizationSchema_1.default.find(query).skip(startIndex).limit(limit);
    const totalOrganizations = await organizationSchema_1.default.countDocuments(query);
    res.status(200).json({ organizations, totalOrganizations });
};
exports.default = allOrganizations;
