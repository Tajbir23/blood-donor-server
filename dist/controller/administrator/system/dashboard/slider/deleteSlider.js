"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sliderSchema_1 = __importDefault(require("../../../../../models/slider/sliderSchema"));
const deleteSlider = async (req, res) => {
    const { id } = req.query;
    try {
        await sliderSchema_1.default.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Slider deleted successfully" });
        return;
    }
    catch (error) {
        console.error("Error deleting slider:", error);
        res.status(500).json({ success: false, message: "Failed to delete slider" });
        return;
    }
};
exports.default = deleteSlider;
