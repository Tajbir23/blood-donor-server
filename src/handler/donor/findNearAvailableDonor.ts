import userModel from "../../models/user/userSchema"

const findNearAvailableDonor = async(latitude: number, longitude: number, bloodGroup: string) => {
    // Calculate date 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    
    try {
        // First check if we can find donors with geo query
        const donors = await userModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 15000 // 15 km
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
                },
                {
                    $or: [
                        { isBanned: false },
                        { isBanned: { $exists: false } }
                    ]
                },
                { isActive: true },
                {
                    $or: [
                        { isVerified: true },
                        { isVerified: { $exists: false } }
                    ]
                }
            ]
        }).lean();

        // Calculate distance for each donor
        const donorsWithDistance = donors.map(donor => {
            // If location exists, calculate distance
            if (donor.location && donor.location.coordinates) {
                const [donorLongitude, donorLatitude] = donor.location.coordinates;
                
                // Calculate distance using Haversine formula
                const R = 6371; // Radius of the earth in km
                const dLat = (donorLatitude - latitude) * Math.PI / 180;
                const dLon = (donorLongitude - longitude) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(latitude * Math.PI / 180) * Math.cos(donorLatitude * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c; // Distance in km
                
                return {
                    ...donor,
                    distance: distance * 1000, // Convert to meters for consistency
                    distanceKm: distance.toFixed(2) + " km"
                };
            }
            
            // If no location, return without distance
            return {
                ...donor,
                distance: null,
                distanceKm: "Unknown"
            };
        });

        // Sort by distance
        donorsWithDistance.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

        
        
        return donorsWithDistance;
    } catch (error) {
        console.error("Error in findNearAvailableDonor:", error);
        // Fall back to search without geospatial query if there's an error
        const donors = await userModel.find({
            bloodGroup: bloodGroup,
            $and: [
                {
                    $or: [
                        { lastDonationDate: { $lte: fourMonthsAgo } },
                        { lastDonationDate: null },
                        { lastDonationDate: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { isBanned: false },
                        { isBanned: { $exists: false } }
                    ]
                },
                { isActive: true },
                {
                    $or: [
                        { isVerified: true },
                        { isVerified: { $exists: false } }
                    ]
                }
            ]
        }).lean();
        
        return donors;
    }
}

export default findNearAvailableDonor