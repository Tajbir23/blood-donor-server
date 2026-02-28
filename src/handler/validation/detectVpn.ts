import { NextFunction, Request, Response } from "express";
import geoip from 'geoip-lite';

// ─── VPN / Proxy Detection Middleware ────────────────────────────────────────
// Strategy:
//   1. req.ip ব্যবহার (trust proxy সেট থাকলে Express সঠিক client IP দেয়)
//   2. geoip-lite দিয়ে country check — Bangladesh (BD) ছাড়া block
//   3. VPN-specific headers detect করে block
//   4. Private / reserved IP ranges allow (localhost dev)
//   5. Server-to-server calls (Vercel/Render) allow via origin/user-agent check
//
// IMPORTANT: app.set('trust proxy', 1) সেট থাকতে হবে server.ts তে
//   — এটা Railway/Render/Vercel proxy-র পেছনে সঠিক IP পেতে দরকার
//   — raw x-forwarded-for header spoofable, তাই সেটা ব্যবহার করা হয় না
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trusted server origins — Vercel/Render Next.js server থেকে API call আসে
 * এগুলো server-to-server call, VPN না — allow করতে হবে
 */
const TRUSTED_ORIGINS = [
    'https://blood-donor-bangladesh.vercel.app',
    'https://blood-donor-client.vercel.app',
];

/**
 * VPN/Proxy-specific headers (NOT infrastructure headers like x-forwarded-for)
 * x-forwarded-for, x-real-ip, forwarded — এগুলো Railway/Cloudflare/nginx সেট করে,
 * তাই এগুলো VPN indicator না।
 */
const VPN_PROXY_HEADERS = [
    'via',                   // HTTP proxy chain identifier — VPN/proxy অবশ্যই সেট করে
    'x-proxy-id',           // custom proxy identifier
    'x-proxy-connection',   // proxy connection header
    'proxy-connection',     // legacy proxy header
    'x-tinyproxy',          // Tinyproxy header
    'x-bluecoat-via',       // BlueCoat proxy
    'x-turbopage',          // Yandex Turbo proxy
] as const;

/** Check if IP is private / loopback (dev environment) */
const isPrivateIp = (ip: string): boolean => {
    return (
        ip === '127.0.0.1' ||
        ip === '::1' ||
        ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) ||
        ip === 'localhost'
    );
};

/** Extract clean IPv4 from possible IPv6-mapped format */
const cleanIpAddress = (ip: string): string => {
    return ip.replace(/^::ffff:/, '').trim();
};

const detectVpn = (req: Request, res: Response, next: NextFunction) => {
    // ── req.ip uses trust proxy setting, so it's safe against XFF spoofing ──
    // With trust proxy: 1, Express takes the IP set by the last trusted proxy
    // (i.e. Railway/Render), NOT the user-spoofable x-forwarded-for value.
    const rawIp = req.ip || req.socket?.remoteAddress;

    if (!rawIp) {
        res.status(403).json({
            success: false,
            message: 'আপনার IP ঠিকানা নির্ধারণ করা যাচ্ছে না। অনুগ্রহ করে VPN বন্ধ করে আবার চেষ্টা করুন।',
            blocked: true,
            reason: 'NO_IP'
        });
        return;
    }

    try {
        const cleanIp = cleanIpAddress(rawIp);

        // ── Allow private/loopback IPs (local development) ────────────────
        if (isPrivateIp(cleanIp)) {
            res.locals.currentIp = cleanIp;
            res.locals.country = 'LOCAL';
            next();
            return;
        }

        // ── Allow server-to-server calls from trusted origins ─────────────
        // Vercel Next.js server actions/API routes call our Express API from
        // US/EU data centers. These are NOT VPN — they are our own frontend server.
        //
        // Detection strategy (multiple signals combined):
        //   a) Origin/Referer header matches our known frontend domains
        //   b) A shared secret header (X-Server-Key) from our Next.js baseUrl
        //   c) User-Agent is node-fetch/undici (servers, not browsers)
        const origin = req.headers['origin'] || req.headers['referer'] || '';
        const originStr = Array.isArray(origin) ? origin[0] : origin;
        const isTrustedOrigin = TRUSTED_ORIGINS.some(trusted => originStr.startsWith(trusted));

        const serverKey = req.headers['x-server-key'];
        const expectedKey = process.env.SERVER_SECRET_KEY;
        const hasValidServerKey = !!expectedKey && serverKey === expectedKey;

        if (isTrustedOrigin || hasValidServerKey) {
            res.locals.currentIp = cleanIp;
            res.locals.country = 'SERVER';
            next();
            return;
        }

        // ── 1. VPN/Proxy header detection ──────────────────────────────────
        // Only check headers that real VPN/proxies add, NOT infrastructure ones
        const detectedVpnHeaders: string[] = [];
        for (const header of VPN_PROXY_HEADERS) {
            if (req.headers[header]) {
                detectedVpnHeaders.push(header);
            }
        }

        // "via" header is the strongest proxy indicator
        // Format: "1.1 proxy-name" or "HTTP/1.1 proxy.example.com"
        const viaHeader = req.headers['via'] as string | undefined;

        // ── 2. GeoIP country check ────────────────────────────────────────
        const geo = geoip.lookup(cleanIp);

        if (!geo) {
            // GeoIP database তে IP নেই — সম্ভাব্য VPN / anonymous proxy
            console.warn(`[VPN-Detect] BLOCKED — no geo data | IP: ${cleanIp} | vpn-headers: [${detectedVpnHeaders.join(', ')}]`);
            res.status(403).json({
                success: false,
                message: 'আপনার অবস্থান নির্ধারণ করা যাচ্ছে না। VPN বা Proxy ব্যবহার করে থাকলে বন্ধ করে আবার চেষ্টা করুন।',
                blocked: true,
                reason: 'UNKNOWN_LOCATION'
            });
            return;
        }

        const country = geo.country; // ISO 3166-1 alpha-2

        // ── 3. Country restriction — Only Bangladesh allowed ───────────────
        if (country !== 'BD') {
            console.warn(`[VPN-Detect] BLOCKED — foreign IP | IP: ${cleanIp} | country: ${country} | via: ${viaHeader || 'none'}`);
            res.status(403).json({
                success: false,
                message: 'এই সেবাটি শুধুমাত্র বাংলাদেশ থেকে ব্যবহারযোগ্য। আপনি যদি VPN ব্যবহার করে থাকেন, অনুগ্রহ করে বন্ধ করুন।',
                blocked: true,
                reason: 'FOREIGN_IP',
                detectedCountry: country
            });
            return;
        }

        // ── 4. BD IP but with VPN-specific headers → block ────────────────
        if (detectedVpnHeaders.length > 0) {
            console.warn(
                `[VPN-Detect] BLOCKED — BD IP with VPN headers | IP: ${cleanIp} | headers: [${detectedVpnHeaders.join(', ')}] | via: ${viaHeader || 'none'}`
            );
            res.status(403).json({
                success: false,
                message: 'VPN বা Proxy ব্যবহার সনাক্ত হয়েছে। অনুগ্রহ করে বন্ধ করে আবার চেষ্টা করুন।',
                blocked: true,
                reason: 'PROXY_DETECTED'
            });
            return;
        }

        // ── All checks passed — allow request ─────────────────────────────
        res.locals.currentIp = cleanIp;
        res.locals.country = country;
        next();
    } catch (error) {
        console.error('[VPN-Detect] Error:', error);
        // On error, allow request to proceed (fail-open) to avoid breaking the app
        next();
    }
};

export default detectVpn;

