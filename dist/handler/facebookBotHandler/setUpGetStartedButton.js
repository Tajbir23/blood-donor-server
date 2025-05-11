"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const setupGetStartedButton = async () => {
    if (!PAGE_ACCESS_TOKEN) {
        console.error("❌ PAGE_ACCESS_TOKEN is missing in .env file");
        return;
    }
    try {
        const response = await axios_1.default.post("https://graph.facebook.com/v18.0/me/messenger_profile", {
            get_started: {
                payload: "GET_STARTED_PAYLOAD",
            },
        }, {
            params: {
                access_token: PAGE_ACCESS_TOKEN,
            },
        });
        console.log("✅ Get Started button set successfully:", response.data);
    }
    catch (error) {
        console.error("❌ Error setting Get Started button:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
        else {
            console.error("Error:", error.message);
        }
    }
};
exports.default = setupGetStartedButton;
