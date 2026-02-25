"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const fbUserSchema_1 = __importDefault(require("../../models/user/fbUserSchema"));
const telegramUserSchema_1 = __importDefault(require("../../models/telegram/telegramUserSchema"));
// ── Haversine distance (returns metres) ──────────────────────────────────────
function haversineMetres(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function attachDistance(donors, lat, lon, source) {
    return donors.map(d => {
        var _a;
        const coords = (_a = d.location) === null || _a === void 0 ? void 0 : _a.coordinates;
        const dist = coords
            ? haversineMetres(lat, lon, coords[1], coords[0])
            : null;
        return {
            ...d,
            source,
            distance: dist,
            distanceKm: dist !== null ? (dist / 1000).toFixed(2) + " km" : "Unknown",
        };
    });
}
// ── Eligibility: 4 months since last donation ─────────────────────────────────
const fourMonthsAgo = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 4);
    return d;
};
const donationEligibilityFilter = () => ({
    $or: [
        { lastDonationDate: { $lte: fourMonthsAgo() } },
        { lastDonationDate: null },
        { lastDonationDate: { $exists: false } },
    ],
});
// ── Geospatial near-query helper ──────────────────────────────────────────────
function nearQuery(lon, lat, maxMetres = 15000) {
    return {
        $near: {
            $geometry: { type: "Point", coordinates: [lon, lat] },
            $maxDistance: maxMetres,
        },
    };
}
const findNearAvailableDonor = async (latitude, longitude, bloodGroup) => {
    try {
        // ── 1. Website users (verified first, then fallback) ─────────────────
        const siteBase = [
            donationEligibilityFilter(),
            { isBanned: { $ne: true } },
            { isActive: true },
        ];
        const [siteVerified, fbDonors, tgDonors] = await Promise.all([
            userSchema_1.default
                .find({
                location: { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 15000 } },
                bloodGroup,
                $and: [...siteBase, { isVerified: true }],
            })
                .select("-password -fingerPrint -token")
                .lean(),
            // ── 2. Facebook bot users ─────────────────────────────────────────
            fbUserSchema_1.default
                .find({
                location: { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 15000 } },
                bloodGroup,
                ...donationEligibilityFilter(),
            })
                .lean(),
            // ── 3. Telegram bot users ─────────────────────────────────────────
            telegramUserSchema_1.default
                .find({
                location: { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 15000 } },
                bloodGroup,
                ...donationEligibilityFilter(),
            })
                .lean(),
        ]);
        let isUnverifiedFallback = false;
        let siteDonors = siteVerified;
        // Fallback to unverified website users if needed
        if (siteDonors.length === 0) {
            siteDonors = await userSchema_1.default
                .find({
                location: { $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 15000 } },
                bloodGroup,
                $and: [
                    ...siteBase,
                    { $or: [{ isVerified: false }, { isVerified: { $exists: false } }, { isVerified: null }] },
                ],
            })
                .select("-password -fingerPrint -token")
                .lean();
            if (siteDonors.length > 0)
                isUnverifiedFallback = true;
        }
        // ── Attach distance + source tag, then merge & sort ───────────────────
        const all = [
            ...attachDistance(siteDonors, latitude, longitude, "website"),
            ...attachDistance(fbDonors, latitude, longitude, "facebook"),
            ...attachDistance(tgDonors, latitude, longitude, "telegram"),
        ].sort((a, b) => {
            if (a.distance === null)
                return 1;
            if (b.distance === null)
                return -1;
            return a.distance - b.distance;
        });
        return { donors: all, isUnverifiedFallback };
    }
    catch (error) {
        console.error("Error in findNearAvailableDonor:", error);
        // ── Geo-free fallback (geo index may be unavailable) ──────────────────
        const siteBase = [
            donationEligibilityFilter(),
            { isBanned: { $ne: true } },
            { isActive: true },
        ];
        const [siteVerified, fbDonors, tgDonors] = await Promise.all([
            userSchema_1.default.find({ bloodGroup, $and: [...siteBase, { isVerified: true }] }).select("-password -fingerPrint -token").lean(),
            fbUserSchema_1.default.find({ bloodGroup, ...donationEligibilityFilter() }).lean(),
            telegramUserSchema_1.default.find({ bloodGroup, ...donationEligibilityFilter() }).lean(),
        ]);
        let isUnverifiedFallback = false;
        let siteDonors = siteVerified;
        if (siteDonors.length === 0) {
            siteDonors = await userSchema_1.default
                .find({
                bloodGroup,
                $and: [
                    ...siteBase,
                    { $or: [{ isVerified: false }, { isVerified: { $exists: false } }, { isVerified: null }] },
                ],
            })
                .select("-password -fingerPrint -token")
                .lean();
            if (siteDonors.length > 0)
                isUnverifiedFallback = true;
        }
        const all = [
            ...siteDonors.map(d => ({ ...d, source: "website" })),
            ...fbDonors.map(d => ({ ...d, source: "facebook" })),
            ...tgDonors.map(d => ({ ...d, source: "telegram" })),
        ];
        return { donors: all, isUnverifiedFallback };
    }
};
exports.default = findNearAvailableDonor;
