"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const findNearAvailableDonor_1 = __importDefault(require("../../handler/donor/findNearAvailableDonor"));
const searchBlood = async (req, res) => {
    try {
        const { bloodGroup, latitude, longitude } = req.body;
        console.log(req.body);
        if (!bloodGroup || !latitude || !longitude) {
            res.status(400).json({
                success: false,
                message: "Blood group, district and thana are required"
            });
            return;
        }
        const parsedLatitude = parseFloat(latitude);
        const parsedLongitude = parseFloat(longitude);
        const bloodGroupStr = bloodGroup;
        const donors = await (0, findNearAvailableDonor_1.default)(parsedLatitude, parsedLongitude, bloodGroupStr);
        res.status(200).json({
            success: true,
            donors
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.default = searchBlood;
