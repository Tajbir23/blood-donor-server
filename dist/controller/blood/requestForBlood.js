"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodRequestSchema_1 = __importDefault(require("../../models/blood/bloodRequestSchema"));
const findNearAvailableDonor_1 = __importDefault(require("../../handler/donor/findNearAvailableDonor"));
const savePatientDetails_1 = __importDefault(require("./savePatientDetails"));
const sendMailToDonor_1 = __importDefault(require("../../handler/donor/sendMailToDonor"));
const requestForBlood = async (req, res) => {
    const data = req.body;
    try {
        const bloodRequest = await bloodRequestSchema_1.default.create(data);
        await bloodRequest.save();
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);
        const donors = await (0, findNearAvailableDonor_1.default)(latitude, longitude, data.bloodGroup);
        const seekerLatitude = parseFloat(data.seekerLatitude);
        const seekerLongitude = parseFloat(data.seekerLongitude);
        await (0, savePatientDetails_1.default)(data.name, data.email, data.mobile, data.seekerDistrictId, data.seekerThanaId, data.seekerBloodGroup, seekerLatitude, seekerLongitude);
        const { results, successCount, failedCount } = await (0, sendMailToDonor_1.default)(donors, data);
        res.status(200).json({
            success: true,
            message: `রক্তের প্রয়োজনে ${successCount} জন দাতাকে প্রয়োজনীয় মেসেজ পাঠানো হয়েছে${failedCount > 0 ? `, ${failedCount} জন দাতার কাছে মেসেজ পাঠানো সফল হয়নি` : ''}`,
            data: {
                bloodRequest,
                emailResults: results
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "রক্তের অনুরোধ সফলভাবে প্রেরিত হয়নি",
        });
    }
};
exports.default = requestForBlood;
