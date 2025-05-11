"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const page_access_token = process.env.PAGE_ACCESS_TOKEN;
const fbBotBaseUrl = `https://graph.facebook.com/v17.0/me/messages?access_token=${page_access_token}`;
exports.default = fbBotBaseUrl;
