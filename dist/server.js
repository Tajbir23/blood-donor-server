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
const facebook_bot_Router_1 = __importDefault(require("./router/facebook_bot/facebook_bot_Router"));
const setUpGetStartedButton_1 = __importDefault(require("./handler/facebookBotHandler/setUpGetStartedButton"));
const setUpPersistantMenu_1 = __importDefault(require("./handler/facebookBotHandler/setUpPersistantMenu"));
const PORT = process.env.PORT || 4000;
exports.app = (0, express_1.default)();
// Trust proxy - required for Railway deployment behind proxy
exports.app.set('trust proxy', 1);
// Basic security with Helmet - helps with many security vulnerabilities including DDoS
// Disable CSP as we'll use our custom implementation for more control
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false // We'll use our custom CSP middleware instead
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
exports.allowOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://0037-103-248-204-82.ngrok-free.app',
    'https://blood-donor-bangladesh.vercel.app',
    'https://blood-donor-client.vercel.app'
];
exports.app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (exports.allowOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true
}));
// Set up static file serving for uploads directory
exports.app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Default CSP header for routes that don't need inline scripts
exports.app.use((req, res, next) => {
    // Skip if it's a route that will set its own CSP
    if (req.path.startsWith('/api/payment/invoice/')) {
        return next();
    }
    // Default strict CSP for API routes
    res.setHeader('Content-Security-Policy', "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self'; " +
        "img-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self';");
    next();
});
// Apply rate limiting to API routes
exports.app.use('/api/', limiter_1.apiLimiter, router_1.default);
const setCookies = (req, res, next) => {
    res.cookie("cookie", "hello world", {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
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
// Error handling middleware
exports.app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});
exports.app.use('/webhook', facebook_bot_Router_1.default);
exports.activeUsers = [];
exports.app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Initialize cron jobs
    (0, organizationCheck_1.default)();
    console.log('Organization check cron job scheduled');
    (0, donationReminder_1.default)();
    console.log('Donation reminder cron job scheduled');
    await (0, setUpGetStartedButton_1.default)();
    console.log('Get Started button set successfully');
    await (0, setUpPersistantMenu_1.default)();
    console.log('Persistent menu set successfully');
});
