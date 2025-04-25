"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sliderSchema_1 = __importDefault(require("../../models/slider/sliderSchema"));
const getActiveBanner = async (req, res) => {
    const slider = await sliderSchema_1.default.find({ isActive: true });
    res.status(201).json({ slider });
};
exports.default = getActiveBanner;
