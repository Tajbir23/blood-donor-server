"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendEmail_1 = __importDefault(require("../../controller/email/sendEmail"));
const findDonorFromSeeker_1 = __importDefault(require("./findDonorFromSeeker"));
const sendMailToDonor = async (donors, data) => {
    let successCount = 0;
    let failedCount = 0;
    const results = [];
    if (!donors.length) {
        donors = await (0, findDonorFromSeeker_1.default)(data.seekerLatitude, data.seekerLongitude);
    }
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
    return { successCount, failedCount, results };
};
exports.default = sendMailToDonor;
