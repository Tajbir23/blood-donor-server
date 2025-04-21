import { Request, Response, NextFunction } from "express";
import * as crypto from 'crypto';

/**
 * Generates a secure random nonce for Content Security Policy
 * @returns A base64 encoded random string
 */
export const generateNonce = (): string => {
    try {
        // Try to use Node.js crypto module
        if (typeof crypto.randomBytes === 'function') {
            return crypto.randomBytes(16).toString('base64');
        }
    } catch (error) {
        console.warn('Crypto.randomBytes not available, using Math.random fallback');
    }
    
    // Fallback for environments where crypto isn't available
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

/**
 * Creates a Content Security Policy header value with the provided nonce
 * @param nonce The nonce to include in the CSP
 * @param options Additional CSP configuration options
 * @returns A CSP header value string
 */
export const createCSP = (nonce: string, options: {
    allowFonts?: boolean,
    allowImages?: boolean,
    allowInlineStyles?: boolean
} = {}): string => {
    const { 
        allowFonts = true, 
        allowImages = true, 
        allowInlineStyles = true 
    } = options;
    
    let csp = `default-src 'self'; `;
    csp += `script-src 'self' 'nonce-${nonce}'; `;
    
    // Style sources
    if (allowInlineStyles) {
        csp += `style-src 'self' 'unsafe-inline'`;
        if (allowFonts) {
            csp += ` https://fonts.googleapis.com`;
        }
        csp += `; `;
    } else {
        csp += `style-src 'self'`;
        if (allowFonts) {
            csp += ` https://fonts.googleapis.com`;
        }
        csp += `; `;
    }
    
    // Font sources
    if (allowFonts) {
        csp += `font-src 'self' https://fonts.gstatic.com; `;
    } else {
        csp += `font-src 'self'; `;
    }
    
    // Image sources
    if (allowImages) {
        csp += `img-src 'self' data: https:; `;
    } else {
        csp += `img-src 'self'; `;
    }
    
    // Additional restrictive policies
    csp += `connect-src 'self'; `;
    csp += `frame-src 'none'; `;
    csp += `object-src 'none'; `;
    csp += `base-uri 'self';`;
    
    return csp;
};

/**
 * Express middleware to add CSP headers to responses
 * @param options Additional CSP configuration options
 * @returns Express middleware function
 */
export const applyCSP = (options: {
    allowFonts?: boolean,
    allowImages?: boolean,
    allowInlineStyles?: boolean
} = {}) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const nonce = generateNonce();
        
        // Attach nonce to request for use in templates
        (req as any).cspNonce = nonce;
        
        // Add CSP header
        res.setHeader('Content-Security-Policy', createCSP(nonce, options));
        
        next();
    };
};

export default {
    generateNonce,
    createCSP,
    applyCSP
}; 