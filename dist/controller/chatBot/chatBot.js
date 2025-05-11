"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleFbBotMessage_1 = __importDefault(require("../../handler/facebookBotHandler/handleFbBotMessage"));
const chatBot = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const body = req.body;
        if (!body || !body.object) {
            console.log("Invalid request body", body);
            res.sendStatus(400);
            return;
        }
        if (body.object === "page") {
            if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
                console.log("Missing entry array in webhook payload");
                res.sendStatus(200); // Still return 200 to acknowledge receipt
                return;
            }
            for (const entry of body.entry) {
                if (!entry.messaging || !Array.isArray(entry.messaging) || entry.messaging.length === 0) {
                    console.log("Missing messaging array in entry");
                    continue;
                }
                const webhookEvent = entry.messaging[0];
                const psId = (_a = webhookEvent.sender) === null || _a === void 0 ? void 0 : _a.id;
                if (!psId) {
                    console.log("Missing sender ID in webhook event");
                    continue;
                }
                const quickReply = (_c = (_b = webhookEvent.message) === null || _b === void 0 ? void 0 : _b.quick_reply) === null || _c === void 0 ? void 0 : _c.payload;
                let quickReplyData = null;
                let quickReplyType = null;
                if (quickReply) {
                    try {
                        quickReplyData = JSON.parse(quickReply);
                        quickReplyType = quickReplyData === null || quickReplyData === void 0 ? void 0 : quickReplyData.type;
                        console.log("quickReplyData", quickReplyData, "quickReplyType", quickReplyType);
                    }
                    catch (error) {
                        console.error("Error parsing quick reply payload:", error);
                    }
                }
                const received_text = (_d = webhookEvent.message) === null || _d === void 0 ? void 0 : _d.text;
                const received_postback = (_e = webhookEvent.postback) === null || _e === void 0 ? void 0 : _e.payload;
                if (received_text || received_postback) {
                    await (0, handleFbBotMessage_1.default)(received_text, received_postback, psId, quickReplyType);
                }
            }
        }
        res.sendStatus(200);
        return;
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(200); // Still return 200 to acknowledge receipt
        return;
    }
};
exports.default = chatBot;
