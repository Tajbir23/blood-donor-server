"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const findBloodFromFb_1 = __importDefault(require("./findBloodFromFb"));
const hasAddressId_1 = __importDefault(require("./hasAddressId"));
const hasBloodGroup_1 = __importDefault(require("./hasBloodGroup"));
const quickReply_1 = __importDefault(require("./quickReply"));
const registerFbUser_1 = __importDefault(require("./registerFbUser"));
const sendMessageToFbUser_1 = require("./sendMessageToFbUser");
const address_1 = require("./address");
const updateLastDonationDateFb_1 = __importDefault(require("./updateLastDonationDateFb"));
const updateLastDonationMapFb_1 = __importDefault(require("./updateLastDonationMapFb"));
const handleFbBotMessage = async (received_text, received_postback, psId, quickReplyType) => {
    try {
        console.log("Handling message:", received_text, received_postback, "type:", quickReplyType, "for PSID:", psId);
        // Validate PSID
        if (!psId || psId === "undefined") {
            console.error("Invalid PSID received:", psId);
            return;
        }
        if (received_postback === "GET_STARTED_PAYLOAD") {
            await (0, quickReply_1.default)(psId, "👋 Welcome to LifeDrop! What would you like to do?", ["Find Blood", "Register", "Donate Blood", "Update Last Donation", "Request for Blood"]);
            return;
        }
        // Handle donate blood postback from persistent menu
        if (received_postback === "DONATE_BLOOD" || received_text === "Donate Blood") {
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "রক্ত দিন, জীবন বাচান", "Register as Donor", `${process.env.FRONTEND_URL}/register?psId=${psId}`);
            return;
        }
        // request for blood
        if (received_postback === "REQUEST_FOR_BLOOD" || received_text === "Request for Blood") {
            await (0, sendMessageToFbUser_1.sendUrlButtonToFbUser)(psId, "রক্তের প্রয়োজন হলে এখানে ক্লিক করুন", "Request for Blood", `${process.env.FRONTEND_URL}/blood-donation`);
            return;
        }
        // Get the last donation data if it exists
        const lastDonationData = updateLastDonationMapFb_1.default.get(psId);
        // Special handling for "More days..." button
        if (received_text === "More days...") {
            console.log("Detected 'More days...' button click");
            if (lastDonationData) {
                const flowType = lastDonationData.flowType;
                console.log(`Current donation flow type: ${flowType}`);
                if (flowType === "day_group1" || flowType === "day_group2" || flowType === "day_group3") {
                    await (0, updateLastDonationDateFb_1.default)(psId, "", flowType, received_text, received_postback);
                    return;
                }
            }
            else {
                console.log("No donation data found for 'More days...' button");
                await (0, quickReply_1.default)(psId, "আমরা আপনার অনুরোধ বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।", ["Update Last Donation"]);
                return;
            }
        }
        // Handle last donation date update flow
        if (received_text === "Update Last Donation" ||
            received_postback === "UPDATE_LAST_DONATION_DATE" ||
            quickReplyType === "update_day" ||
            quickReplyType === "update_month" ||
            quickReplyType === "update_year" ||
            quickReplyType === "day_group1" ||
            quickReplyType === "day_group2" ||
            quickReplyType === "day_group3" ||
            quickReplyType === "day_group4") {
            console.log("Handling last donation date update. Type:", quickReplyType, "Data:", lastDonationData);
            if (received_text === "Update Last Donation" || received_postback === "UPDATE_LAST_DONATION_DATE") {
                console.log("Starting last donation date update flow");
                await (0, updateLastDonationDateFb_1.default)(psId, "Select year", "first_call", received_text, received_postback);
                return;
            }
            if (lastDonationData) {
                const flowType = lastDonationData.flowType;
                console.log(`Continuing last donation update flow: ${flowType}, text: ${received_text}`);
                await (0, updateLastDonationDateFb_1.default)(psId, "", flowType, received_text, received_postback);
                return;
            }
            else {
                console.log("Last donation data not found, restarting flow");
                await (0, updateLastDonationDateFb_1.default)(psId, "Select year", "first_call", received_text, received_postback);
                return;
            }
        }
        // Get current user data if any
        const userData = address_1.userAdressMap.get(psId) || {};
        // Check for explicit Find Blood or FIND_BLOOD first
        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD") {
            console.log("Detected explicit Find Blood request");
            await (0, findBloodFromFb_1.default)(psId, "", received_text, "findBlood", received_postback);
            return;
        }
        // Then handle Search Donors reply specifically
        if (quickReplyType === "searchDonors" || received_text === "Search Donors" || (received_text === null || received_text === void 0 ? void 0 : received_text.includes("Donors"))) {
            console.log("Detected Search Donors request");
            await (0, findBloodFromFb_1.default)(psId, "", received_text, "searchDonors", received_postback);
            return;
        }
        // If we're already in the findBlood flow, keep routing to findBloodFromFb
        if (userData.flowType === "findBlood") {
            console.log("Continuing Find Blood flow based on stored user data");
            await (0, findBloodFromFb_1.default)(psId, "Select area", received_text, quickReplyType || "", received_postback);
            return;
        }
        // First check for registration flow - include all registration-related quickReplyTypes or check flowType
        if (received_text === "Register" || received_postback === "REGISTER" ||
            quickReplyType === "register" || quickReplyType === "registerComplete" ||
            quickReplyType === "confirmDone" ||
            userData.flowType === "register" ||
            (quickReplyType === "bloodGroup" && !(received_text === null || received_text === void 0 ? void 0 : received_text.match(/Find|Search/)))) {
            console.log("Routing to registration flow");
            await (0, registerFbUser_1.default)(psId, received_text, received_postback, quickReplyType);
            return;
        }
        // Then handle Find Blood flow for quickReply responses
        if (quickReplyType === "division" || quickReplyType === "district" ||
            quickReplyType === "thana" || quickReplyType === "bloodGroup") {
            console.log("Routing to Find Blood flow based on quickReplyType:", quickReplyType);
            await (0, findBloodFromFb_1.default)(psId, "Select area", received_text, quickReplyType, received_postback);
            return;
        }
        // Handle direct address IDs without explicit quickReplyType
        if ((0, hasAddressId_1.default)(received_text)) {
            // If flowType is explicitly set to register, route to register
            if (userData.flowType === "register") {
                console.log("Routing address ID to registration");
                await (0, registerFbUser_1.default)(psId, received_text, received_postback, "addressId");
            }
            else {
                // Default to findBlood for address IDs
                console.log("Routing address ID to Find Blood");
                await (0, findBloodFromFb_1.default)(psId, "Select area", received_text, "addressId", received_postback);
            }
            return;
        }
        // Check for blood groups without explicit quickReplyType
        if ((0, hasBloodGroup_1.default)(received_text)) {
            if (userData.flowType === "findBlood" && userData.thanaId) {
                console.log("Detected blood group in Find Blood flow");
                await (0, findBloodFromFb_1.default)(psId, "", received_text, "bloodGroup", "");
                return;
            }
            else if (userData.flowType === "register") {
                console.log("Detected blood group in Register flow");
                await (0, registerFbUser_1.default)(psId, received_text, "", "bloodGroup");
                return;
            }
        }
        // Default to the main menu if we can't determine the flow
        console.log("No matching condition found, showing default menu");
        await (0, quickReply_1.default)(psId, "আমি আপনাকে বুঝতে পারিনি। আবার চেষ্টা করুন।", ["Find Blood", "Register", "Donate Blood", "Update Last Donation", "Request for Blood"]);
        return;
    }
    catch (error) {
        console.error("Error in handleFbBotMessage:", error);
        // We don't throw here to prevent app crashes
    }
};
exports.default = handleFbBotMessage;
