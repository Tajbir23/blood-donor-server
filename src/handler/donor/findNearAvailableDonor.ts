import userModel from "../../models/user/userSchema"

const findNearAvailableDonor = async(latitude: number, longitude: number) => {
    // Calculate date 4 months ago
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const fourMonthsAgoStr = fourMonthsAgo.toISOString().split('T')[0];
    
    const donors = await userModel.find({
        isActive: true,
        canDonate: true,
        isVerified: true,
        isBanned: false,
        $or: [
            { lastDonationDate: null },
            { lastDonationDate: { $lt: fourMonthsAgoStr } }
        ],
        location: {
            $near: { $geometry: { type: "Point", coordinates: [longitude, latitude] }, $maxDistance: 100000 }
        }
    })
    return donors
}

export default findNearAvailableDonor