"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodRequestSchema_1 = __importDefault(require("../../models/blood/bloodRequestSchema"));
const findNearAvailableDonor_1 = __importDefault(require("../../handler/donor/findNearAvailableDonor"));
const sendEmail_1 = __importDefault(require("../email/sendEmail"));
const requestForBlood = async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const bloodRequest = await bloodRequestSchema_1.default.create(data);
        await bloodRequest.save();
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);
        const donors = await (0, findNearAvailableDonor_1.default)(latitude, longitude);
        console.log("donors", donors);
        let successCount = 0;
        let failedCount = 0;
        const results = [];
        for (const donor of donors) {
            if (!donor.email)
                continue;
            try {
                const result = await (0, sendEmail_1.default)({
                    email: donor.email,
                    subject: "জরুরী রক্ত দরকার",
                    templateType: "bloodRequest",
                    templateData: {
                        name: donor.fullName,
                        patientName: data.patientName,
                        patientProblem: data.patientProblem,
                        patientGender: data.patientGender,
                        patientAge: data.patientAge,
                        bloodGroup: data.bloodGroup,
                        bloodUnits: data.bloodUnits,
                        hospital: data.hospitalName,
                        hospitalWard: data.hospitalWard,
                        requiredDate: data.requiredDate,
                        requiredTime: data.requiredTime,
                        reason: data.reason,
                        address: `${data.districtId}, ${data.thanaId}`,
                        contact: data.mobile,
                        alternativeContact: data.alternativeContact,
                    }
                });
                if (result.success) {
                    successCount++;
                    results.push({
                        donor: donor.fullName,
                        status: 'success',
                        message: 'মেসেজ পাঠানো হয়েছে'
                    });
                }
                else {
                    failedCount++;
                    results.push({
                        donor: donor.fullName,
                        status: 'failed',
                        message: 'মেসেজ পাঠানো সফল হয়নি'
                    });
                }
            }
            catch (error) {
                console.log(error);
                failedCount++;
                results.push({
                    donor: donor.fullName,
                    status: 'failed',
                    message: 'মেসেজ পাঠানো সফল হয়নি'
                });
            }
        }
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
