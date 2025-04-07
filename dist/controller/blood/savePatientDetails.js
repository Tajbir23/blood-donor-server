"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const patient_detailsSchema_1 = __importDefault(require("../../models/blood/patient_detailsSchema"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const savePatientDetails = async (name, email, phone, districtId, thanaId, bloodGroup, latitude, longitude) => {
    try {
        // Check if a patient with this email already exists
        const existingPatient = await patient_detailsSchema_1.default.findOne({ email });
        const existingUser = await userSchema_1.default.findOne({ email });
        // Only create and save if the email doesn't exist
        if (!existingPatient || !existingUser) {
            const patientDetails = await patient_detailsSchema_1.default.create({
                name,
                email,
                phone,
                districtId,
                thanaId,
                bloodGroup,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            });
            await patientDetails.save();
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = savePatientDetails;
