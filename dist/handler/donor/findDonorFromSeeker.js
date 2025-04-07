"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const patient_detailsSchema_1 = __importDefault(require("../../models/blood/patient_detailsSchema"));
const findDonorFromSeeker = async (latitude, longitude) => {
    const donors = await patient_detailsSchema_1.default.find({
        location: {
            $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 100000 }
        }
    });
    return donors;
};
exports.default = findDonorFromSeeker;
