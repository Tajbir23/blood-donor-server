import findNearAvailableDonor from "../donor/findNearAvailableDonor";
import { userAdressMap } from "./address";
import addressHandler from "./addressHandler";
import quickReply from "./quickReply";
import sendMessageToFbUser from "./sendMessageToFbUser";

const findBloodFromFb = async (psId: string, title: string, received_text: string, quickReplyType: string, received_postback?: string) => {
    const userData = await userAdressMap.get(psId);

    console.log("quickReplyType", quickReplyType, "received_text", received_text, "received_postback", received_postback, "findBloodFromFb");
    await addressHandler(psId, title, received_text, quickReplyType);

    if(quickReplyType === "thana"){
        await quickReply(psId, "Select blood group", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
    }

    if(quickReplyType === "bloodGroup"){
        userAdressMap.set(psId, {
            ...userData,
            bloodGroup: received_postback || received_text
        });
        await quickReply(psId, "Location selected successfully! What would you like to do next?", ["Search Donors", "Cancel"], "searchDonors");
    }

    if(quickReplyType === "searchDonors"){
        const latitude = parseFloat(userData.latitude);
        const longitude = parseFloat(userData.longitude);
        console.log("latitude", latitude, "longitude", longitude, "bloodGroup", userData.bloodGroup);
        const donors = await findNearAvailableDonor(latitude, longitude, userData.bloodGroup);

        console.log(donors);
        if(donors.length > 0){
            donors.forEach(async (donor) => {
                const donorWithDistance = donor as any;
                await sendMessageToFbUser(psId, `ডোনার নাম: ${donorWithDistance.fullName}\nরক্তের গ্রুপ: ${donorWithDistance.bloodGroup}\nআপনার থেকে দূরত্ব: ${donorWithDistance.distanceKm || 'অজানা'}\nসর্বশেষ প্রদান করার তারিখ: ${donorWithDistance.lastDonationDate}\nযোগাযোগ করতে চাইলে এই নম্বরে যোগাযোগ করুন: ${donorWithDistance.phone}`);
            });
        }else{
            await sendMessageToFbUser(psId, "No donors found");
        }
    }
}

export default findBloodFromFb;