import userModel from "../../models/user/userSchema"

const findNearAvailableDonor = async(latitude: number, longitude: number) => {
    // Calculate date 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    
    const donors = await userModel.find({
        $and: [
            // Donor eligibility criteria
            {
                $or: [
                    { lastDonationDate: { $lte: fourMonthsAgo } },
                    { lastDonationDate: null },
                    { lastDonationDate: { $exists: false } }
                ]
            },
            
            // User must not be banned
            { 
                $or: [
                    { isBanned: false },
                    { isBanned: { $exists: false } }
                ] 
            },
            
            // Additional criteria for active and verified users
            { isActive: true },
            { 
                $or: [
                    { isVerified: true },
                    { isVerified: { $exists: false } }
                ] 
            }
        ],
        location: {
            $near: { 
                $geometry: { 
                    type: "Point", 
                    coordinates: [longitude, latitude] 
                }, 
                $maxDistance: 100000 
            }
        }
    });
    
    return donors;
}

export default findNearAvailableDonor