"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMultipleUrlButtonToFbUser = exports.sendGenericTemplate = exports.sendUrlButtonToFbUser = void 0;
const axios_1 = __importDefault(require("axios"));
const botBaseUrl_1 = __importDefault(require("./botBaseUrl"));
/**
 * Send a simple text message to a Facebook user
 */
const sendMessageToFbUser = async (psId, message) => {
    var _a, _b, _c, _d, _e;
    try {
        const response = await axios_1.default.post(botBaseUrl_1.default, {
            recipient: {
                id: psId
            },
            message: {
                text: message
            },
            messaging_type: "RESPONSE"
        });
        return response.data;
    }
    catch (error) {
        if ((_d = (_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.includes("outside of allowed window")) {
            console.log(`Cannot send message to ${psId} - outside 24-hour window`);
            return null;
        }
        console.error("Error sending message:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        throw error;
    }
};
exports.default = sendMessageToFbUser;
/**
 * Send a message with a URL button to a Facebook user
 */
const sendUrlButtonToFbUser = async (psId, message, buttonText, url) => {
    try {
        await axios_1.default.post(botBaseUrl_1.default, {
            recipient: {
                id: psId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: message,
                        buttons: [
                            {
                                type: "web_url",
                                url: url,
                                title: buttonText,
                                webview_height_ratio: "full"
                            }
                        ]
                    }
                }
            }
        });
    }
    catch (error) {
        console.error("Error sending URL button:", error);
    }
};
exports.sendUrlButtonToFbUser = sendUrlButtonToFbUser;
/**
 * Send a message with multiple URL buttons to a Facebook user
 */
const sendMultipleUrlButtonToFbUser = async (psId, message, buttons) => {
    try {
        await axios_1.default.post(botBaseUrl_1.default, {
            recipient: {
                id: psId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: message,
                        buttons: buttons.map(button => ({
                            type: "web_url",
                            url: button.url,
                            title: button.title,
                            webview_height_ratio: "full"
                        }))
                    }
                }
            }
        });
    }
    catch (error) {
        console.error("Error sending multiple URL buttons:", error);
    }
};
exports.sendMultipleUrlButtonToFbUser = sendMultipleUrlButtonToFbUser;
/**
 * Send a generic template with multiple URL buttons
 */
const sendGenericTemplate = async (psId, elements) => {
    try {
        await axios_1.default.post(botBaseUrl_1.default, {
            recipient: {
                id: psId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements.map(element => ({
                            title: element.title,
                            subtitle: element.subtitle || "",
                            image_url: element.image_url,
                            buttons: element.buttons.map(button => ({
                                type: "web_url",
                                url: button.url,
                                title: button.title,
                                webview_height_ratio: "full"
                            }))
                        }))
                    }
                }
            }
        });
    }
    catch (error) {
        console.error("Error sending generic template:", error);
    }
};
exports.sendGenericTemplate = sendGenericTemplate;
