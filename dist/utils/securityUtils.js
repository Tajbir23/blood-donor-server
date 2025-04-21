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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCSP = exports.createCSP = exports.generateNonce = void 0;
const crypto = __importStar(require("crypto"));
/**
 * Generates a secure random nonce for Content Security Policy
 * @returns A base64 encoded random string
 */
const generateNonce = () => {
    try {
        // Try to use Node.js crypto module
        if (typeof crypto.randomBytes === 'function') {
            return crypto.randomBytes(16).toString('base64');
        }
    }
    catch (error) {
        console.warn('Crypto.randomBytes not available, using Math.random fallback');
    }
    // Fallback for environments where crypto isn't available
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};
exports.generateNonce = generateNonce;
/**
 * Creates a Content Security Policy header value with the provided nonce
 * @param nonce The nonce to include in the CSP
 * @param options Additional CSP configuration options
 * @returns A CSP header value string
 */
const createCSP = (nonce, options = {}) => {
    const { allowFonts = true, allowImages = true, allowInlineStyles = true } = options;
    let csp = `default-src 'self'; `;
    csp += `script-src 'self' 'nonce-${nonce}'; `;
    // Style sources
    if (allowInlineStyles) {
        csp += `style-src 'self' 'unsafe-inline'`;
        if (allowFonts) {
            csp += ` https://fonts.googleapis.com`;
        }
        csp += `; `;
    }
    else {
        csp += `style-src 'self'`;
        if (allowFonts) {
            csp += ` https://fonts.googleapis.com`;
        }
        csp += `; `;
    }
    // Font sources
    if (allowFonts) {
        csp += `font-src 'self' https://fonts.gstatic.com; `;
    }
    else {
        csp += `font-src 'self'; `;
    }
    // Image sources
    if (allowImages) {
        csp += `img-src 'self' data: https:; `;
    }
    else {
        csp += `img-src 'self'; `;
    }
    // Additional restrictive policies
    csp += `connect-src 'self'; `;
    csp += `frame-src 'none'; `;
    csp += `object-src 'none'; `;
    csp += `base-uri 'self';`;
    return csp;
};
exports.createCSP = createCSP;
/**
 * Express middleware to add CSP headers to responses
 * @param options Additional CSP configuration options
 * @returns Express middleware function
 */
const applyCSP = (options = {}) => {
    return (req, res, next) => {
        const nonce = (0, exports.generateNonce)();
        // Attach nonce to request for use in templates
        req.cspNonce = nonce;
        // Add CSP header
        res.setHeader('Content-Security-Policy', (0, exports.createCSP)(nonce, options));
        next();
    };
};
exports.applyCSP = applyCSP;
exports.default = {
    generateNonce: exports.generateNonce,
    createCSP: exports.createCSP,
    applyCSP: exports.applyCSP
};
