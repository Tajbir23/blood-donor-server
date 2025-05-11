"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("./address");
const quickReply_1 = __importDefault(require("./quickReply"));
const hasAddressId_1 = __importDefault(require("./hasAddressId"));
const sendMessageToFbUser_1 = __importDefault(require("./sendMessageToFbUser"));
const addressHandler = async (psId, title, selectedId, quickReplyType) => {
    try {
        console.log("Address Handler:", { psId, title, selectedId, quickReplyType });
        // Get current user data or initialize
        let userData = address_1.userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            flowType: undefined
        };
        // Determine the flow type - this is critical for routing messages correctly
        if (quickReplyType === "findBlood" || (quickReplyType === null || quickReplyType === void 0 ? void 0 : quickReplyType.includes("find"))) {
            userData.flowType = "findBlood";
        }
        else if (!userData.flowType) {
            userData.flowType = "register"; // Default to register if no flow type specified
        }
        // Add debug logging to see what flow we're in
        console.log(`AddressHandler for ${psId} - Flow: ${userData.flowType}`);
        // Always save the flow type to ensure it's preserved
        address_1.userAdressMap.set(psId, userData);
        // Handle initial state - show divisions
        if (!selectedId) {
            const divisions = await (0, address_1.getDivision)();
            await (0, quickReply_1.default)(psId, title, divisions.map(div => div.id), 
            // Preserve the flow type in the quickReplyType
            userData.flowType === "findBlood" ? "division" : "division");
            return;
        }
        // Handle division selection
        if (quickReplyType === "division") {
            // Save division ID while preserving flow type
            userData.divisionId = selectedId;
            address_1.userAdressMap.set(psId, userData);
            // Get districts for selected division
            const districts = await (0, address_1.getDistrict)(selectedId);
            // Send quick reply with districts
            await (0, quickReply_1.default)(psId, "জেলা নির্বাচন করুন", districts.map(district => district.id), "district");
            return;
        }
        // Handle district selection
        if (quickReplyType === "district") {
            // Save district ID while preserving flow type
            userData.districtId = selectedId;
            address_1.userAdressMap.set(psId, userData);
            // Get thanas for selected district
            const thanas = await (0, address_1.getThana)(selectedId, userData.divisionId);
            // Send quick reply with thanas
            await (0, quickReply_1.default)(psId, "থানা/উপজেলা নির্বাচন করুন", thanas.map(thana => thana.id), "thana");
            return;
        }
        // Handle thana selection 
        if (quickReplyType === "thana") {
            // Get thanas to find the one with matching ID
            const thanas = await (0, address_1.getThana)(userData.districtId, userData.divisionId);
            const selectedThana = thanas.find(thana => thana.id === selectedId);
            if (selectedThana) {
                // Update user data with thana info while preserving flow type
                userData.thanaId = selectedId;
                userData.latitude = selectedThana.latitude;
                userData.longitude = selectedThana.longitude;
                address_1.userAdressMap.set(psId, userData);
                // Success message
                await (0, sendMessageToFbUser_1.default)(psId, `ঠিকানা সংরক্ষণ করা হয়েছে: ${userData.divisionId}, ${userData.districtId}, ${userData.thanaId}`);
                console.log(`Saved address for ${psId}:`, userData);
            }
            else {
                // Error message if thana not found
                await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার নির্বাচিত এলাকা খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                // Restart with divisions
                const divisions = await (0, address_1.getDivision)();
                await (0, quickReply_1.default)(psId, "আপনার বিভাগ নির্বাচন করুন:", divisions.map(div => div.id), "division");
            }
            return;
        }
        // For any direct address ID (fallback)
        if ((0, hasAddressId_1.default)(selectedId)) {
            // Try to determine what level we're at based on current user data
            if (!userData.divisionId) {
                // Division selection while preserving flow type
                userData.divisionId = selectedId;
                address_1.userAdressMap.set(psId, userData);
                const districts = await (0, address_1.getDistrict)(selectedId);
                await (0, quickReply_1.default)(psId, "জেলা নির্বাচন করুন", districts.map(district => district.id), "district");
                return;
            }
            else if (!userData.districtId) {
                // District selection while preserving flow type
                userData.districtId = selectedId;
                address_1.userAdressMap.set(psId, userData);
                const thanas = await (0, address_1.getThana)(selectedId, userData.divisionId);
                await (0, quickReply_1.default)(psId, "থানা/উপজেলা নির্বাচন করুন", thanas.map(thana => thana.id), "thana");
                return;
            }
            else if (!userData.thanaId) {
                // Thana selection while preserving flow type
                const thanas = await (0, address_1.getThana)(userData.districtId, userData.divisionId);
                const selectedThana = thanas.find(thana => thana.id === selectedId);
                if (selectedThana) {
                    userData.thanaId = selectedId;
                    userData.latitude = selectedThana.latitude;
                    userData.longitude = selectedThana.longitude;
                    address_1.userAdressMap.set(psId, userData);
                    await (0, sendMessageToFbUser_1.default)(psId, `ঠিকানা সংরক্ষণ করা হয়েছে: ${userData.divisionId}, ${userData.districtId}, ${userData.thanaId}`);
                    console.log(`Saved address for ${psId}:`, userData);
                }
                else {
                    await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার নির্বাচিত এলাকা খুঁজে পাওয়া যায়নি।");
                }
                return;
            }
        }
    }
    catch (error) {
        console.error("Error in addressHandler:", error);
        await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার ঠিকানা সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
};
exports.default = addressHandler;
