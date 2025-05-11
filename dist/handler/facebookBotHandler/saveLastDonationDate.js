"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fbUserSchema_1 = __importDefault(require("../../models/user/fbUserSchema"));
const saveLastDonationDate = async (psId, year, month, day) => {
    console.log("Save last donation", { year, month, day });
    const user = await fbUserSchema_1.default.findOne({ psId: psId });
    const months = {
        "January": "01",
        "February": "02",
        "March": "03",
        "April": "04",
        "May": "05",
        "June": "06",
        "July": "07",
        "August": "08",
        "September": "09",
        "October": "10",
        "November": "11",
        "December": "12",
    };
    const monthNumber = months[month];
    const date = `${year}-${monthNumber}-${day}`;
    console.log("Date", date);
    user.lastDonationDate = new Date(date);
    await user.save();
};
exports.default = saveLastDonationDate;
