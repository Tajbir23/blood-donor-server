"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fbUserSchema_1 = __importDefault(require("../../models/user/fbUserSchema"));
const findNearFbDonar = async (latitude, longitude, bloodGroup) => {
    console.log("Finding near FB donar with latitude:", latitude, "longitude:", longitude, "bloodGroup:", bloodGroup);
    // calculate 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    try {
        const donars = await fbUserSchema_1.default.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 15000
                }
            },
            bloodGroup: bloodGroup,
            $and: [
                {
                    $or: [
                        { lastDonationDate: { $lte: fourMonthsAgo } },
                        { lastDonationDate: null },
                        { lastDonationDate: { $exists: false } }
                    ]
                }
            ]
        }).lean();
        const donarsWithDistance = donars.map(donar => {
            if (donar.location && donar.location.coordinates) {
                const [donorLongitude, donorLatitude] = donar.location.coordinates;
                const R = 6371;
                const dLat = (donorLatitude - latitude) * Math.PI / 180;
                const dLon = (donorLongitude - longitude) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(latitude) * Math.cos(donorLatitude);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c; // Distance in km
                return { ...donar, distance: distance * 1000, distanceKm: distance.toFixed(2) + " km" };
            }
        });
        donarsWithDistance.sort((a, b) => {
            if (a.distance === null)
                return 1;
            if (b.distance === null)
                return -1;
            return a.distance - b.distance;
        });
        return donarsWithDistance;
    }
    catch (error) {
        console.log(error);
        return [];
    }
};
exports.default = findNearFbDonar;
