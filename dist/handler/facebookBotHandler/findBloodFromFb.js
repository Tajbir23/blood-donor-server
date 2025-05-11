"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const findNearAvailableDonor_1 = __importDefault(require("../donor/findNearAvailableDonor"));
const address_1 = require("./address");
const addressHandler_1 = __importDefault(require("./addressHandler"));
const quickReply_1 = __importDefault(require("./quickReply"));
const sendMessageToFbUser_1 = __importDefault(require("./sendMessageToFbUser"));
const findBloodFromFb = async (psId, title, received_text, quickReplyType, received_postback) => {
    try {
        console.log("FindBloodFromFb:", { psId, title, received_text, quickReplyType, received_postback });
        // Get current user data (if any)
        const userData = address_1.userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            bloodGroup: "",
            flowType: "findBlood"
        };
        // Always ensure we're in the findBlood flow
        userData.flowType = "findBlood";
        address_1.userAdressMap.set(psId, userData);
        // Handle initial Find Blood request - start flow
        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD") {
            console.log("Starting Find Blood flow for", psId);
            // Reset user data for a fresh search
            address_1.userAdressMap.delete(psId);
            // Start with division selection - mark as findBlood flow
            address_1.userAdressMap.set(psId, {
                divisionId: "",
                districtId: "",
                thanaId: "",
                latitude: "",
                longitude: "",
                bloodGroup: "",
                flowType: "findBlood"
            });
            await (0, addressHandler_1.default)(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
            return;
        }
        // Handle address selection (division/district/thana)
        if (quickReplyType === "division" || quickReplyType === "district" || quickReplyType === "addressId") {
            console.log(`Handling ${quickReplyType} selection in Find Blood flow:`, received_text);
            // Ensure we're in the findBlood flow
            userData.flowType = "findBlood";
            address_1.userAdressMap.set(psId, userData);
            await (0, addressHandler_1.default)(psId, title || "Select area", received_text, quickReplyType);
            return;
        }
        // When thana is selected, ask for blood group
        if (quickReplyType === "thana") {
            console.log("Handling thana selection in Find Blood flow:", received_text);
            // Process the thana selection
            userData.flowType = "findBlood";
            address_1.userAdressMap.set(psId, userData);
            await (0, addressHandler_1.default)(psId, title || "Select thana", received_text, quickReplyType);
            // Get the updated user data after thana selection
            const updatedUserData = address_1.userAdressMap.get(psId);
            console.log("User data after thana selection:", updatedUserData);
            // Only proceed to blood group selection if thana was successfully saved
            if (updatedUserData && updatedUserData.thanaId && updatedUserData.latitude && updatedUserData.longitude) {
                updatedUserData.flowType = "findBlood";
                address_1.userAdressMap.set(psId, updatedUserData);
                // Important: Add a slight delay to ensure all previous operations are complete
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log("Proceeding to blood group selection");
                await (0, quickReply_1.default)(psId, "রক্তের গ্রুপ নির্বাচন করুন", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
            }
            else {
                // If we didn't get a valid thana selection, restart the flow
                await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার অবস্থান সঠিকভাবে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await (0, addressHandler_1.default)(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
            }
            return;
        }
        // Handle blood group selection
        if (quickReplyType === "bloodGroup") {
            console.log("Handling blood group selection in Find Blood flow:", received_text);
            const bloodGroup = received_text || received_postback;
            // Get the updated user data to ensure we have location info
            const currentData = address_1.userAdressMap.get(psId);
            if (!currentData || !currentData.latitude || !currentData.longitude) {
                await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার অবস্থান সঠিকভাবে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await (0, addressHandler_1.default)(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
                return;
            }
            // Update with blood group
            currentData.bloodGroup = bloodGroup;
            currentData.flowType = "findBlood"; // Ensure we maintain the flow type
            address_1.userAdressMap.set(psId, currentData);
            console.log("User data after blood group selection:", currentData);
            await (0, quickReply_1.default)(psId, "অবস্থান এবং রক্তের গ্রুপ সফলভাবে নির্বাচন করা হয়েছে! এখন কি করতে চান?", ["Search Donors", "Cancel"], "searchDonors");
            return;
        }
        // Handle search donors request - Make sure we accept both the button text and quickReplyType
        if (quickReplyType === "searchDonors" || received_text === "Search Donors" || (received_text === null || received_text === void 0 ? void 0 : received_text.includes("Donors"))) {
            console.log("Handling search donors request:", received_text);
            const updatedUserData = address_1.userAdressMap.get(psId);
            console.log("User data for search:", updatedUserData);
            if (!updatedUserData || !updatedUserData.latitude || !updatedUserData.longitude || !updatedUserData.bloodGroup) {
                await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, আপনার অবস্থান বা রক্তের গ্রুপ সম্পর্কে সম্পূর্ণ তথ্য নেই। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await (0, addressHandler_1.default)(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
                return;
            }
            const latitude = parseFloat(updatedUserData.latitude);
            const longitude = parseFloat(updatedUserData.longitude);
            await (0, sendMessageToFbUser_1.default)(psId, `${updatedUserData.bloodGroup} রক্তের গ্রুপের দাতা খোঁজা হচ্ছে...`);
            try {
                const donors = await (0, findNearAvailableDonor_1.default)(latitude, longitude, updatedUserData.bloodGroup);
                if (donors && donors.length > 0) {
                    await (0, sendMessageToFbUser_1.default)(psId, `${donors.length} জন ${updatedUserData.bloodGroup} রক্তের গ্রুপের দাতা পাওয়া গেছে।`);
                    // Send each donor as a separate message (max 5 to avoid spam)
                    for (let i = 0; i < Math.min(donors.length, 5); i++) {
                        const donorWithDistance = donors[i];
                        await (0, sendMessageToFbUser_1.default)(psId, `ডোনার নাম: ${donorWithDistance.fullName}\nরক্তের গ্রুপ: ${donorWithDistance.bloodGroup}\nআপনার থেকে দূরত্ব: ${donorWithDistance.distanceKm || 'অজানা'}\nযোগাযোগ করতে চাইলে এই নম্বরে যোগাযোগ করুন: ${donorWithDistance.phone}`);
                        // Add a small delay between messages
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    if (donors.length > 5) {
                        await (0, sendMessageToFbUser_1.default)(psId, `এবং আরও ${donors.length - 5} জন রক্তদাতা রয়েছে।`);
                    }
                }
                else {
                    await (0, sendMessageToFbUser_1.default)(psId, "আপনার আশেপাশে ১৫ কিলোমিটার দূরত্বে কোনো রক্তদানকারী পাওয়া যায়নি।");
                }
            }
            catch (error) {
                console.error("Error searching for donors:", error);
                await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, রক্তদাতা খোঁজার সময় একটি ত্রুটি ঘটেছে।");
            }
            // Clear user data after search
            address_1.userAdressMap.delete(psId);
            // Return to main menu
            await (0, quickReply_1.default)(psId, "আর কিছু করতে চান?", ["Find Blood", "Register", "Donate Blood", "Update Last Donation", "Request for Blood"]);
            return;
        }
        // Handle cancel
        if (quickReplyType === "searchDonors" && (received_text === "Cancel" || (received_text === null || received_text === void 0 ? void 0 : received_text.includes("Cancel")))) {
            console.log("Cancelling blood search");
            address_1.userAdressMap.delete(psId);
            await (0, sendMessageToFbUser_1.default)(psId, "রক্তদাতা খোঁজা বাতিল করা হয়েছে।");
            await (0, quickReply_1.default)(psId, "আপনি কি করতে চান?", ["Find Blood", "Register", "Donate Blood", "Update Last Donation", "Request for Blood"]);
            return;
        }
        // If no condition was matched, try to handle the message based on user data
        const currentUserData = address_1.userAdressMap.get(psId);
        if (currentUserData && currentUserData.flowType === "findBlood") {
            if (!currentUserData.divisionId) {
                // If no division yet, treat as division selection
                await (0, addressHandler_1.default)(psId, "বিভাগ নির্বাচন করুন", received_text, "division");
                return;
            }
            else if (!currentUserData.districtId) {
                // If division but no district, treat as district selection
                await (0, addressHandler_1.default)(psId, "জেলা নির্বাচন করুন", received_text, "district");
                return;
            }
            else if (!currentUserData.thanaId) {
                // If district but no thana, treat as thana selection
                await (0, addressHandler_1.default)(psId, "থানা/উপজেলা নির্বাচন করুন", received_text, "thana");
                return;
            }
            else if (!currentUserData.bloodGroup) {
                // If we have location but no blood group, treat as blood group selection
                if (["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(received_text)) {
                    const updatedData = { ...currentUserData, bloodGroup: received_text };
                    address_1.userAdressMap.set(psId, updatedData);
                    await (0, quickReply_1.default)(psId, "অবস্থান এবং রক্তের গ্রুপ সফলভাবে নির্বাচন করা হয়েছে! এখন কি করতে চান?", ["Search Donors", "Cancel"], "searchDonors");
                    return;
                }
            }
        }
    }
    catch (error) {
        console.error("Error in findBloodFromFb:", error);
        await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
};
exports.default = findBloodFromFb;
