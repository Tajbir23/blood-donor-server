"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sliderSchema_1 = __importDefault(require("../../../../../models/slider/sliderSchema"));
const toggleActive = async (req, res) => {
    const id = req.query.id;
    try {
        const slider = await sliderSchema_1.default.findById(id);
        if (!slider) {
            res.status(404).json({ success: false, message: "Slider not found" });
            return;
        }
        // Toggle the boolean value
        slider.isActive = !slider.isActive;
        // Save the updated document
        await slider.save();
        res.status(200).json({
            success: true,
            message: "Slider isActive toggled successfully",
            data: slider,
        });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
        return;
    }
};
exports.default = toggleActive;
