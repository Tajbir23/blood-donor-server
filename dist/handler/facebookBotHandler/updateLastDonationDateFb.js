"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateLastDonationDateFb;
const quickReply_1 = __importDefault(require("./quickReply"));
const updateLastDonationMapFb_1 = __importDefault(require("./updateLastDonationMapFb"));
const sendMessageToFbUser_1 = __importDefault(require("./sendMessageToFbUser"));
const fbUserSchema_1 = __importDefault(require("../../models/user/fbUserSchema"));
const saveLastDonationDate_1 = __importDefault(require("./saveLastDonationDate"));
async function updateLastDonationDateFb(psId, text, type, receivedText, receivedPostback) {
    console.log(`updateLastDonationDateFb called with type: ${type}, receivedText: ${receivedText}`);
    const isUserExists = await fbUserSchema_1.default.findOne({ psId: psId });
    if (!isUserExists) {
        await (0, sendMessageToFbUser_1.default)(psId, "আপনি আমাদের বেবহারকারি নন। আপনার প্রথম রক্তদানের তারিখ সংরক্ষণ করতে পারবেন না। আপনাকে প্রথমে নিবন্ধন করতে হবে।");
        await (0, quickReply_1.default)(psId, "নিবন্ধন করতে Register বাটনে ক্লিক করুন", ["Register"], "register");
        return;
    }
    try {
        let lastDonationData = updateLastDonationMapFb_1.default.get(psId) || {};
        console.log("Current lastDonationData:", lastDonationData);
        if (type === "first_call") {
            updateLastDonationMapFb_1.default.set(psId, { flowType: "update_year" });
            console.log("Setting flow to update_year");
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = 0; i < 5; i++) {
                years.push((currentYear - i).toString());
            }
            await (0, quickReply_1.default)(psId, "আপনি শেষ কবে রক্ত দান করেছেন? প্রথমে বছর নির্বাচন করুন:", years, "update_year");
            return;
        }
        if (type === "update_year") {
            // Year is selected, save it and ask for month
            lastDonationData.year = receivedText;
            lastDonationData.flowType = "update_month";
            updateLastDonationMapFb_1.default.set(psId, lastDonationData);
            console.log(`Year ${receivedText} selected, setting flow to update_month`);
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            await (0, quickReply_1.default)(psId, "মাস নির্বাচন করুন:", months, "update_month");
            return;
        }
        if (type === "update_month") {
            // Month is selected, save it and ask for day (group 1)
            lastDonationData.month = receivedText;
            lastDonationData.flowType = "day_group1";
            updateLastDonationMapFb_1.default.set(psId, lastDonationData);
            console.log(`Month ${receivedText} selected, setting flow to day_group1`);
            // Days 1-8 plus More button
            const daysGroup1 = ["1", "2", "3", "4", "5", "6", "7", "8", "More days..."];
            await (0, quickReply_1.default)(psId, "দিন নির্বাচন করুন:", daysGroup1, "day_group1");
            return;
        }
        if (type === "day_group1") {
            if (receivedText === "More days...") {
                // User wants to see more days
                lastDonationData.flowType = "day_group2";
                updateLastDonationMapFb_1.default.set(psId, lastDonationData);
                console.log("User clicked More days, switching to day_group2");
                // Days 9-16 plus More button
                const daysGroup2 = ["9", "10", "11", "12", "13", "14", "15", "16", "More days..."];
                await (0, quickReply_1.default)(psId, "দিন নির্বাচন করুন:", daysGroup2, "day_group2");
                return;
            }
            else {
                // Day is selected from group 1
                lastDonationData.day = receivedText;
                updateLastDonationMapFb_1.default.delete(psId); // Clear data after saving
                console.log(`Day ${receivedText} selected, saving full date`);
                // Build the date string
                const dateString = `${lastDonationData.year}-${getMonthNumber(lastDonationData.month)}-${receivedText.padStart(2, '0')}`;
                console.log(`Formatted date: ${dateString}`);
                // TODO: Save the date to the user's profile in the database
                await (0, saveLastDonationDate_1.default)(psId, lastDonationData.year, lastDonationData.month, lastDonationData.day);
                await (0, sendMessageToFbUser_1.default)(psId, `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`);
                return;
            }
        }
        if (type === "day_group2") {
            if (receivedText === "More days...") {
                // User wants to see more days
                lastDonationData.flowType = "day_group3";
                updateLastDonationMapFb_1.default.set(psId, lastDonationData);
                console.log("User clicked More days, switching to day_group3");
                // Days 17-24 plus More button
                const daysGroup3 = ["17", "18", "19", "20", "21", "22", "23", "24", "More days..."];
                await (0, quickReply_1.default)(psId, "দিন নির্বাচন করুন:", daysGroup3, "day_group3");
                return;
            }
            else {
                // Day is selected from group 2
                lastDonationData.day = receivedText;
                updateLastDonationMapFb_1.default.delete(psId); // Clear data after saving
                console.log(`Day ${receivedText} selected, saving full date`);
                // Build the date string
                const dateString = `${lastDonationData.year}-${getMonthNumber(lastDonationData.month)}-${receivedText.padStart(2, '0')}`;
                console.log(`Formatted date: ${dateString}`);
                // TODO: Save the date to the user's profile in the database
                await (0, saveLastDonationDate_1.default)(psId, lastDonationData.year, lastDonationData.month, lastDonationData.day);
                await (0, sendMessageToFbUser_1.default)(psId, `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`);
                return;
            }
        }
        if (type === "day_group3") {
            if (receivedText === "More days...") {
                // User wants to see more days
                lastDonationData.flowType = "day_group4";
                updateLastDonationMapFb_1.default.set(psId, lastDonationData);
                console.log("User clicked More days, switching to day_group4");
                // Days 25-31
                const daysGroup4 = ["25", "26", "27", "28", "29", "30", "31"];
                await (0, quickReply_1.default)(psId, "দিন নির্বাচন করুন:", daysGroup4, "day_group4");
                return;
            }
            else {
                // Day is selected from group 3
                lastDonationData.day = receivedText;
                updateLastDonationMapFb_1.default.delete(psId); // Clear data after saving
                console.log(`Day ${receivedText} selected, saving full date`);
                // Build the date string
                const dateString = `${lastDonationData.year}-${getMonthNumber(lastDonationData.month)}-${receivedText.padStart(2, '0')}`;
                console.log(`Formatted date: ${dateString}`);
                // TODO: Save the date to the user's profile in the database
                await (0, saveLastDonationDate_1.default)(psId, lastDonationData.year, lastDonationData.month, lastDonationData.day);
                await (0, sendMessageToFbUser_1.default)(psId, `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`);
                return;
            }
        }
        if (type === "day_group4") {
            // Day is selected from group 4
            lastDonationData.day = receivedText;
            updateLastDonationMapFb_1.default.delete(psId); // Clear data after saving
            console.log(`Day ${receivedText} selected, saving full date`);
            // Build the date string
            const dateString = `${lastDonationData.year}-${getMonthNumber(lastDonationData.month)}-${receivedText.padStart(2, '0')}`;
            console.log(`Formatted date: ${dateString}`);
            // TODO: Save the date to the user's profile in the database
            await (0, saveLastDonationDate_1.default)(psId, lastDonationData.year, lastDonationData.month, lastDonationData.day);
            await (0, sendMessageToFbUser_1.default)(psId, `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`);
            return;
        }
        // If we get here, something went wrong
        console.error("Unhandled donation flow type:", type);
        await (0, quickReply_1.default)(psId, "দুঃখিত, কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।", ["Update Last Donation"]);
    }
    catch (error) {
        console.error("Error in updateLastDonationDateFb:", error);
        await (0, sendMessageToFbUser_1.default)(psId, "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
}
// Helper function to convert month name to number
function getMonthNumber(monthName) {
    const months = {
        "January": "01", "February": "02", "March": "03", "April": "04",
        "May": "05", "June": "06", "July": "07", "August": "08",
        "September": "09", "October": "10", "November": "11", "December": "12"
    };
    return months[monthName] || "01"; // Default to 01 if not found
}
