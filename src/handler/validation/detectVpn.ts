import { NextFunction, Request, Response } from "express";
import geoip from 'geoip-lite';

const detectVpn = (req: Request, res: Response, next: NextFunction) => {
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
        
        const geo = geoip.lookup(cleanIp);
        
        if (!geo) {
            console.log('Unable to determine location for IP:', cleanIp);
            next();
            return;
        }
        
        // Check if the IP is from Bangladesh (country code: BD)
        if (geo.country === 'BD') {
            console.log('IP is from Bangladesh');
        } else {
            console.log('IP is not from Bangladesh, country:', geo.country);
        }
        
        // Store IP in res.locals instead of req
        res.locals.currentIp = ip;
        next();
    } catch (error) {
        console.error('Error processing IP:', error);
        next();
    }
}

export default detectVpn;

