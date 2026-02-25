"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const address_1 = require("./address");
const quickReply_1 = __importDefault(require("./quickReply"));
const fbUserSchema_1 = __importDefault(require("../../models/user/fbUserSchema"));
const sendMessageToFbUser_1 = __importStar(require("./sendMessageToFbUser"));
// Validate Bangladeshi mobile numbers
function isValidBDPhone(phone) {
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.trim());
}
function normalizeBDPhone(phone) {
    return phone.trim().replace(/^\+?88/, "");
}
const getUserProfile = async (psId) => {
    try {
        const response = await axios_1.default.get(`https://graph.facebook.com/${psId}?fields=first_name,last_name&access_token=${process.env.PAGE_ACCESS_TOKEN}`);
        return {
            firstName: response.data.first_name,
            lastName: response.data.last_name,
            fullName: `${response.data.first_name} ${response.data.last_name}`
        };
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return {
            firstName: "",
            lastName: "",
            fullName: ""
        };
    }
};
const registerFbUser = async (psId, received_text, received_postback, quickReplyType) => {
    var _a;
    try {
        console.log("Register FB User:", { psId, received_text, received_postback, quickReplyType });
        const fbUser = await fbUserSchema_1.default.findOne({ psId });
        if (fbUser) {
            await (0, sendMessageToFbUser_1.default)(psId, 'ইতোমধ্যে আপনার ফেসবুক অ্যাকাউন্টে রেজিস্ট্রেশন সম্পন্ন হয়েছে। আমাদের ওয়েবসাইটে লগইন করুন অথবা রেজিস্ট্রেশন করুন।');
            await (0, sendMessageToFbUser_1.sendMultipleUrlButtonToFbUser)(psId, 'আমাদের ওয়েবসাইটে লগইন করুণ অথবা রেজিস্টার করুন', [{
                    title: "ওয়েবসাইটে লগইন করুন",
                    url: `${process.env.FRONTEND_URL}/login`
                }, {
                    title: "ওয়েবসাইটে রেজিস্ট্রেশন করুন",
                    url: `${process.env.FRONTEND_URL}/register`
                }]);
            return;
        }
        // Initialize or get existing user data
        const userData = address_1.userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            flowType: "register" // Mark that we're in the registration flow
        };
        // Always set flowType to register when in this function
        userData.flowType = "register";
        // Initial registration step from menu
        if (received_postback === "REGISTER" || received_text === "Register") {
            // Get user profile from Facebook
            const profile = await getUserProfile(psId);
            // Update the map with user's name from FB profile
            address_1.userAdressMap.set(psId, {
                ...userData,
                fullName: profile.fullName,
                flowType: "register",
                awaitingPhone: true,
            });
            // Ask for phone number first
            await (0, sendMessageToFbUser_1.default)(psId, `ধন্যবাদ ${profile.firstName}! রেজিস্ট্রেশন শুরু করুন।\n\n` +
                `আপনার মোবাইল নম্বর লিখুন (যেমন: 01712345678):`);
            return;
        }
        // Handle phone number input
        if (userData.awaitingPhone) {
            const phone = (received_text === null || received_text === void 0 ? void 0 : received_text.trim()) || "";
            if (!isValidBDPhone(phone)) {
                await (0, sendMessageToFbUser_1.default)(psId, "❌ সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।\n" +
                    "নম্বর অবশ্যই 01 দিয়ে শুরু হতে হবে এবং মোট ১১ সংখ্যার হতে হবে।\n" +
                    "(যেমন: 01712345678)");
                return;
            }
            address_1.userAdressMap.set(psId, {
                ...userData,
                phoneNumber: normalizeBDPhone(phone),
                awaitingPhone: false,
                flowType: "register",
            });
            await (0, quickReply_1.default)(psId, `✅ মোবাইল নম্বর সংরক্ষিত হয়েছে।\n\nএখন আপনার রক্তের গ্রুপ নির্বাচন করুন:`, ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
            return;
        }
        // Handle blood group selection
        if (quickReplyType === "bloodGroup") {
            address_1.userAdressMap.set(psId, {
                ...userData,
                bloodGroup: received_text,
                flowType: "register"
            });
            // Get divisions from geo data
            const divisions = await (0, address_1.getDivision)();
            // Ask for location (division)
            await (0, quickReply_1.default)(psId, "আপনার বিভাগ নির্বাচন করুন:", divisions.map(div => div.id), "division");
            return;
        }
        // Handle division selection
        if (quickReplyType === "division") {
            address_1.userAdressMap.set(psId, {
                ...userData,
                divisionId: received_text,
                flowType: "register"
            });
            // Get districts from selected division
            const districts = await (0, address_1.getDistrict)(received_text);
            // Ask for district selection
            await (0, quickReply_1.default)(psId, "আপনার জেলা নির্বাচন করুন:", districts.map(district => district.id), "district");
            return;
        }
        // Handle district selection
        if (quickReplyType === "district") {
            address_1.userAdressMap.set(psId, {
                ...userData,
                districtId: received_text,
                flowType: "register"
            });
            // Get thanas from selected district
            const thanas = await (0, address_1.getThana)(received_text, userData.divisionId);
            // Ask for thana selection
            await (0, quickReply_1.default)(psId, "আপনার উপজেলা/থানা নির্বাচন করুন:", thanas.map(thana => thana.id), "thana");
            return;
        }
        // Handle thana selection
        if (quickReplyType === "thana") {
            // Get thana details to set latitude and longitude
            const thanas = await (0, address_1.getThana)(userData.districtId, userData.divisionId);
            const selectedThana = thanas.find(thana => thana.id === received_text);
            address_1.userAdressMap.set(psId, {
                ...userData,
                thanaId: received_text,
                latitude: (selectedThana === null || selectedThana === void 0 ? void 0 : selectedThana.latitude) || "",
                longitude: (selectedThana === null || selectedThana === void 0 ? void 0 : selectedThana.longitude) || "",
                flowType: "register"
            });
            // Show confirmation with all collected data
            const updatedUserData = address_1.userAdressMap.get(psId);
            await (0, sendMessageToFbUser_1.default)(psId, `রেজিস্ট্রেশন সম্পন্ন! আপনার তথ্য:\nনাম: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.fullName}\nমোবাইল: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.phoneNumber}\nরক্তের গ্রুপ: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.bloodGroup}\nবিভাগ: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.divisionId}\nজেলা: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.districtId}\nথানা: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.thanaId}`);
            await (0, quickReply_1.default)(psId, `রেজিস্ট্রেশন সম্পন্ন! আপনার তথ্য:\nনাম: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.fullName}\nরক্তের গ্রুপ: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.bloodGroup}\nবিভাগ: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.divisionId}\nজেলা: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.districtId}\nথানা: ${updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.thanaId}`, ["ঠিক আছে", "তথ্য পরিবর্তন করুন"], "registerComplete");
            return;
        }
        // Handle registration completion response
        if (quickReplyType === "registerComplete") {
            if (received_text === "ঠিক আছে") {
                await (0, quickReply_1.default)(psId, "ধন্যবাদ! আপনি সফলভাবে রেজিস্ট্রেশন করেছেন। যখনই কেউ রক্তের প্রয়োজনে আপনার কাছে আসবে, আমরা আপনাকে জানাব।", ["ঠিক আছে"], "confirmDone");
                // Registration is complete, clear the flow type
                const updatedUserData = address_1.userAdressMap.get(psId);
                if (updatedUserData) {
                    address_1.userAdressMap.set(psId, {
                        ...updatedUserData,
                        flowType: undefined
                    });
                }
                // if not found then create new fb user
                const fbUser = await fbUserSchema_1.default.findOne({ psId });
                if (!fbUser) {
                    const latitude = (updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.latitude) ? parseFloat(updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.latitude) : 0;
                    const longitude = (updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.longitude) ? parseFloat(updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.longitude) : 0;
                    const newFbUser = await fbUserSchema_1.default.create({
                        psId,
                        fullName: updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.fullName,
                        phoneNumber: (_a = updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.phoneNumber) !== null && _a !== void 0 ? _a : "",
                        bloodGroup: updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.bloodGroup,
                        divisionId: updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.divisionId,
                        districtId: updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.districtId,
                        thanaId: updatedUserData === null || updatedUserData === void 0 ? void 0 : updatedUserData.thanaId,
                        latitude,
                        longitude,
                        location: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        }
                    });
                    await newFbUser.save();
                    await address_1.userAdressMap.delete(psId);
                    await (0, sendMessageToFbUser_1.sendMultipleUrlButtonToFbUser)(psId, 'আমাদের ওয়েবসাইটে লগইন করুণ অথবা রেজিস্টার করুন', [{
                            title: "ওয়েবসাইটে লগইন করুন",
                            url: `${process.env.FRONTEND_URL}/login`
                        }, {
                            title: "ওয়েবসাইটে রেজিস্ট্রেশন করুন",
                            url: `${process.env.FRONTEND_URL}/register`
                        }]);
                }
            }
            else if (received_text === "তথ্য পরিবর্তন করুন") {
                // Start registration process again
                await (0, quickReply_1.default)(psId, "আপনার রক্তের গ্রুপ নির্বাচন করুন:", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
            }
            return;
        }
    }
    catch (error) {
        console.error("Error in registerFbUser:", error);
    }
};
exports.default = registerFbUser;
