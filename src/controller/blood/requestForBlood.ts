import { Request, Response } from "express"
import bloodRequestModel from "../../models/blood/bloodRequestSchema"
import findNearAvailableDonor from "../../handler/donor/findNearAvailableDonor"
import savePatientDetails from "./savePatientDetails"
import sendMailToDonor from "../../handler/donor/sendMailToDonor"
import findNearFbDonar from "../../handler/facebookBotHandler/findNearFbDonar"
import sendMessageToFbUser from "../../handler/facebookBotHandler/sendMessageToFbUser"

const requestForBlood = async (req: Request, res: Response) => {
    const data = req.body
    
    if(!data.hospitalId){
        data.hospitalId = data.hospitalName
    }
    try {
        const bloodRequest = await bloodRequestModel.create(data)
        await bloodRequest.save()

        const latitude = parseFloat(data.latitude)
        const longitude = parseFloat(data.longitude)

        const donors = await findNearAvailableDonor(latitude, longitude, data.bloodGroup)
        const fbDonors = await findNearFbDonar(latitude, longitude, data.bloodGroup)
        
        const seekerLatitude = parseFloat(data.seekerLatitude)
        const seekerLongitude = parseFloat(data.seekerLongitude)
        await savePatientDetails(data.name, data.email, data.mobile, data.seekerDistrictId, data.seekerThanaId, data.seekerBloodGroup, seekerLatitude, seekerLongitude)
        

        const {results, successCount, failedCount} = await sendMailToDonor(donors, data)
        for (const donor of fbDonors) {
            await sendMessageToFbUser(donor.psId, 
                `🩸 *রক্তের প্রয়োজন* 🩸\n\n` +
                `🔴 রক্তের গ্রুপ: ${data.bloodGroup}\n` +
                `👤 রোগীর নাম: ${data.patientName}\n` +
                `🩺 সমস্যা: ${data.patientProblem}\n` +
                `🔢 রোগীর বয়স: ${data.patientAge}\n` +
                `⚧️ লিঙ্গ: ${data.patientGender}\n\n` +
                `📱 যোগাযোগ:\n` +
                `   ☎️ মোবাইল: ${data.mobile}\n` +
                `   ☎️ বিকল্প নম্বর: ${data.alternativeContact}\n\n` +
                `📍 অবস্থান:\n` +
                `   🏙️ জেলা: ${data.seekerDistrictId}\n` +
                `   🏘️ থানা: ${data.seekerThanaId}\n\n` +
                `⏰ সময়সূচী:\n` +
                `   📅 তারিখ: ${data.requredDate}\n` +
                `   🕒 সময়: ${data.requredTime}\n\n` +
                `🚨 জরুরীতা: ${data.urgencyLevel}\n\n` +
                `আপনার সাহায্য একটি জীবন বাঁচাতে পারে। দয়া করে সাড়া দিন।` +
                `\n\n` +
                `👉 এই প্রয়োজনের জন্য আপনার সাহায্য একটি জীবন বাঁচাতে পারে। দয়া করে সাড়া দিন।` +
                `\n\n` +
                `আরও রক্তের আবেদন দেখতে এখানে ক্লিক করুন: ${process.env.FRONTEND_URL}/blood-request`
            )
        }
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