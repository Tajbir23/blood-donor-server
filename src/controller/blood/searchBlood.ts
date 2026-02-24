import { Request, Response } from "express"
import findNearAvailableDonor from "../../handler/donor/findNearAvailableDonor"

const searchBlood = async (req: Request, res: Response) => {
    try {
        const {bloodGroup, latitude, longitude} = req.body

    if(!bloodGroup || !latitude || !longitude) {
        res.status(400).json({
            success: false,
            message: "Blood group, district and thana are required"
        })
        return
    }
    
    const parsedLatitude = parseFloat(latitude as string);
    const parsedLongitude = parseFloat(longitude as string);
    const bloodGroupStr = bloodGroup as string;
    
    const result = await findNearAvailableDonor(parsedLatitude, parsedLongitude, bloodGroupStr)

    res.status(200).json({
        success: true,
        donors: result.donors,
        isUnverifiedFallback: result.isUnverifiedFallback
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export default searchBlood
