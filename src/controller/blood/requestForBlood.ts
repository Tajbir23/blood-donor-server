import { Request, Response } from "express"
import bloodRequestModel from "../../models/blood/bloodRequestSchema"
import findNearAvailableDonor from "../../handler/donor/findNearAvailableDonor"
import sendEmail from "../email/sendEmail"
import savePatientDetails from "./savePatientDetails"
import sendMailToDonor from "../../handler/donor/sendMailToDonor"

const requestForBlood = async (req: Request, res: Response) => {
    const data = req.body
    
    try {
        const bloodRequest = await bloodRequestModel.create(data)
        await bloodRequest.save()

        const latitude = parseFloat(data.latitude)
        const longitude = parseFloat(data.longitude)

        const donors = await findNearAvailableDonor(latitude, longitude)
       
        
        const seekerLatitude = parseFloat(data.seekerLatitude)
        const seekerLongitude = parseFloat(data.seekerLongitude)
        await savePatientDetails(data.name, data.email, data.mobile, data.seekerDistrictId, data.seekerThanaId, data.seekerBloodGroup, seekerLatitude, seekerLongitude)
        
        
        const {results, successCount, failedCount} = await sendMailToDonor(donors, data)

        res.status(200).json({
            success: true,
            message: `রক্তের প্রয়োজনে ${successCount} জন দাতাকে প্রয়োজনীয় মেসেজ পাঠানো হয়েছে${failedCount > 0 ? `, ${failedCount} জন দাতার কাছে মেসেজ পাঠানো সফল হয়নি` : ''}`,
            data: {
                bloodRequest,
                emailResults: results
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "রক্তের অনুরোধ সফলভাবে প্রেরিত হয়নি",
        })
    }
}

export default requestForBlood