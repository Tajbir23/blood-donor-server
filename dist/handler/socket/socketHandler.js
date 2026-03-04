"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const liveChatSocket_1 = __importDefault(require("./liveChatSocket"));
const setUpSocketHandler = (io) => {
    io.on('connection', (socket) => {
    });
    // Live Chat namespace
    (0, liveChatSocket_1.default)(io);
};
exports.default = setUpSocketHandler;
