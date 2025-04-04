"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeUsers = exports.allowOrigins = exports.app = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const limiter_1 = require("./config/limiter");
const router_1 = __importDefault(require("./router/router"));
const organizationCheck_1 = __importDefault(require("./cron/organizationCheck"));
const donationReminder_1 = __importDefault(require("./cron/donationReminder"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const PORT = process.env.PORT || 4000;
exports.app = (0, express_1.default)();
// Basic security with Helmet - helps with many security vulnerabilities including DDoS
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false
}));
// Set up custom morgan format to show cookies
exports.app.use((0, morgan_1.default)(':method :url :status :res[set-cookie] - :response-time ms'));
// Request size limiting to prevent request flooding
exports.app.use(express_1.default.json({ limit: '10kb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
exports.app.use((0, cookie_parser_1.default)());
// Connect to MongoDB
(0, db_1.default)();
// CORS setup - must be before routes
exports.allowOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];
exports.app.use((0, cors_1.default)({
    origin: exports.allowOrigins,
    credentials: true
}));
// Set up static file serving for uploads directory
exports.app.use('/api/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Apply rate limiting to API routes
exports.app.use('/api/', limiter_1.apiLimiter, router_1.default);
const setCookies = (req, res, next) => {
    res.cookie("cookie", "hello world", {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
    next();
};
// Test route
exports.app.get('/', setCookies, async (req, res) => {
    res.send({ message: "hello rangpur" });
});
exports.app.get('/test-cookie', (req, res) => {
    res.cookie("testCookie", "works", {
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
    res.send({ message: "Cookie set!" });
});
exports.activeUsers = [];
exports.app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Initialize cron jobs
    (0, organizationCheck_1.default)();
    console.log('Organization check cron job scheduled');
    (0, donationReminder_1.default)();
    console.log('Donation reminder cron job scheduled');
});
