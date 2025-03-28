"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const detectVpn = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!ip) {
        res.status(400).json({ message: 'Unable to determine IP address' });
        return;
    }
    try {
        // Convert IP to string if it's an array
        const ipAddress = Array.isArray(ip) ? ip[0] : ip;
        // Remove IPv6 prefix if present
        const cleanIp = ipAddress.replace(/^::ffff:/, '');
        const geo = geoip_lite_1.default.lookup(cleanIp);
        if (!geo) {
            console.log('Unable to determine location for IP:', cleanIp);
            next();
            return;
        }
        // Check if the IP is from Bangladesh (country code: BD)
        if (geo.country === 'BD') {
            console.log('IP is from Bangladesh');
        }
        else {
            console.log('IP is not from Bangladesh, country:', geo.country);
        }
        // Store IP in res.locals instead of req
        res.locals.currentIp = ip;
        next();
    }
    catch (error) {
        console.error('Error processing IP:', error);
        next();
    }
};
exports.default = detectVpn;
