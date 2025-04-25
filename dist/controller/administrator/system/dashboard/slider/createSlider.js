"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sliderSchema_1 = __importDefault(require("../../../../../models/slider/sliderSchema"));
const createSlider = async (req, res) => {
    const data = JSON.parse(req.body.sliderData);
    const image = res.locals.imageUrl;
    const user = req.user;
    try {
        const slider = await sliderSchema_1.default.create({
            ...data,
            image: image,
            createdBy: user._id
        });
        res.status(201).json({
            success: true,
            message: "Slider created successfully",
            slider
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Slider creation failed",
            error: error
        });
    }
};
exports.default = createSlider;
