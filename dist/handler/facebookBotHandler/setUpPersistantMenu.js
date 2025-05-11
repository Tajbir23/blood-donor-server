"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const setupPersistentMenu = async () => {
    var _a;
    try {
        await axios_1.default.post(`https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
            persistent_menu: [
                {
                    locale: "default",
                    composer_input_disabled: false,
                    call_to_actions: [
                        {
                            type: "postback",
                            title: "Find Blood",
                            payload: "FIND_BLOOD",
                        },
                        {
                            type: "postback",
                            title: "Register",
                            payload: "REGISTER",
                        },
                        {
                            type: "postback",
                            title: "Update Last Donation Date",
                            payload: "UPDATE_LAST_DONATION_DATE",
                        },
                        {
                            type: "postback",
                            title: "Donate Blood",
                            payload: "DONATE_BLOOD",
                        },
                        {
                            type: "postback",
                            title: "Request for Blood",
                            payload: "REQUEST_FOR_BLOOD",
                        }
                    ],
                },
            ],
        });
        console.log("✅ Persistent menu set successfully");
    }
    catch (error) {
        console.error("❌ Failed to set persistent menu:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error);
    }
};
exports.default = setupPersistentMenu;
