"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const retryWithBackoff_1 = __importDefault(require("../../utils/retryWithBackoff"));
const quickReply = async (psId, title, replies, type) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    try {
        // Validate psId
        if (!psId || psId === "undefined") {
            console.error("Invalid PSID:", psId);
            return;
        }
        const response = await (0, retryWithBackoff_1.default)(() => axios_1.default.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
            recipient: { id: psId },
            message: {
                text: title,
                quick_replies: replies.map(label => ({
                    content_type: "text",
                    title: label,
                    payload: JSON.stringify({
                        type: type,
                        payload: label
                    }),
                }))
            }
        }));
        console.log(`Quick reply sent successfully to ${psId}`);
        return response;
    }
    catch (error) {
        // Check for specific error types
        if (((_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.code) === 100) {
            console.error(`User not found: PSID ${psId} is invalid`);
        }
        else if (((_f = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.code) === 10) {
            console.error(`Permission denied: Missing messaging permissions`);
        }
        else if (((_j = (_h = (_g = error.response) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.error) === null || _j === void 0 ? void 0 : _j.code) === 105 && ((_o = (_m = (_l = (_k = error.response) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.error) === null || _m === void 0 ? void 0 : _m.message) === null || _o === void 0 ? void 0 : _o.includes('has too many elements'))) {
            console.error(`Too many quick replies: Maximum is 13 buttons per message`);
        }
        else {
            console.error("Error sending quick reply:", ((_q = (_p = error.response) === null || _p === void 0 ? void 0 : _p.data) === null || _q === void 0 ? void 0 : _q.error) || error.message);
        }
        // Don't throw the error - we want the app to continue running
        return null;
    }
};
exports.default = quickReply;
