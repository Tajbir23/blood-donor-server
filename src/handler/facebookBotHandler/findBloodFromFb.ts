import findNearAvailableDonor from "../donor/findNearAvailableDonor";
import { userAdressMap } from "./address";
import addressHandler from "./addressHandler";
import quickReply from "./quickReply";
import sendMessageToFbUser from "./sendMessageToFbUser";

interface UserData {
    divisionId?: string;
    districtId?: string;
    thanaId?: string;
    latitude?: string;
    longitude?: string;
    bloodGroup?: string;
    fullName?: string;
    flowType?: 'register' | 'findBlood';
}

const findBloodFromFb = async (psId: string, title: string, received_text: string, quickReplyType: string, received_postback?: string) => {
    try {
        console.log("FindBloodFromFb:", { psId, title, received_text, quickReplyType, received_postback });
        
        // Get current user data (if any)
        const userData = userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            bloodGroup: "",
            flowType: "findBlood"
        } as UserData;
        
        // Always ensure we're in the findBlood flow
        userData.flowType = "findBlood";
        userAdressMap.set(psId, userData);
        
        // Handle initial Find Blood request - start flow
        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD") {
            console.log("Starting Find Blood flow for", psId);
            // Reset user data for a fresh search
            userAdressMap.delete(psId);
            
            // Start with division selection - mark as findBlood flow
            userAdressMap.set(psId, {
                divisionId: "",
                districtId: "",
                thanaId: "",
                latitude: "",
                longitude: "",
                bloodGroup: "",
                flowType: "findBlood"
            });
            
            await addressHandler(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
            return;
        }
        
        // Handle address selection (division/district/thana)
        if (quickReplyType === "division" || quickReplyType === "district" || quickReplyType === "addressId") {
            console.log(`Handling ${quickReplyType} selection in Find Blood flow:`, received_text);
            // Ensure we're in the findBlood flow
            userData.flowType = "findBlood";
            userAdressMap.set(psId, userData);
            
            await addressHandler(psId, title || "Select area", received_text, quickReplyType);
            return;
        }
        
        // When thana is selected, ask for blood group
        if (quickReplyType === "thana") {
            console.log("Handling thana selection in Find Blood flow:", received_text);
            // Process the thana selection
            userData.flowType = "findBlood";
            userAdressMap.set(psId, userData);
            
            await addressHandler(psId, title || "Select thana", received_text, quickReplyType);
            
            // Get the updated user data after thana selection
            const updatedUserData = userAdressMap.get(psId) as UserData;
            console.log("User data after thana selection:", updatedUserData);
            
            // Only proceed to blood group selection if thana was successfully saved
            if (updatedUserData && updatedUserData.thanaId && updatedUserData.latitude && updatedUserData.longitude) {
                updatedUserData.flowType = "findBlood";
                userAdressMap.set(psId, updatedUserData);
                
                // Important: Add a slight delay to ensure all previous operations are complete
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log("Proceeding to blood group selection");
                await quickReply(psId, "রক্তের গ্রুপ নির্বাচন করুন", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], "bloodGroup");
            } else {
                // If we didn't get a valid thana selection, restart the flow
                await sendMessageToFbUser(psId, "দুঃখিত, আপনার অবস্থান সঠিকভাবে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await addressHandler(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
            }
            return;
        }
        
        // Handle blood group selection
        if (quickReplyType === "bloodGroup") {
            console.log("Handling blood group selection in Find Blood flow:", received_text);
            const bloodGroup = received_text || received_postback;
            
            // Get the updated user data to ensure we have location info
            const currentData = userAdressMap.get(psId) as UserData;
            
            if (!currentData || !currentData.latitude || !currentData.longitude) {
                await sendMessageToFbUser(psId, "দুঃখিত, আপনার অবস্থান সঠিকভাবে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await addressHandler(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
                return;
            }
            
            // Update with blood group
            currentData.bloodGroup = bloodGroup;
            currentData.flowType = "findBlood"; // Ensure we maintain the flow type
            userAdressMap.set(psId, currentData);
            
            console.log("User data after blood group selection:", currentData);
            
            await quickReply(
                psId, 
                "অবস্থান এবং রক্তের গ্রুপ সফলভাবে নির্বাচন করা হয়েছে! এখন কি করতে চান?", 
                ["Search Donors", "Cancel"], 
                "searchDonors"
            );
            return;
        }
        
        // Handle search donors request - Make sure we accept both the button text and quickReplyType
        if (quickReplyType === "searchDonors" || received_text === "Search Donors" || received_text?.includes("Donors")) {
            console.log("Handling search donors request:", received_text);
            const updatedUserData = userAdressMap.get(psId) as UserData;
            console.log("User data for search:", updatedUserData);
            
            if (!updatedUserData || !updatedUserData.latitude || !updatedUserData.longitude || !updatedUserData.bloodGroup) {
                await sendMessageToFbUser(psId, "দুঃখিত, আপনার অবস্থান বা রক্তের গ্রুপ সম্পর্কে সম্পূর্ণ তথ্য নেই। অনুগ্রহ করে আবার চেষ্টা করুন।");
                await addressHandler(psId, "বিভাগ নির্বাচন করুন", undefined, "findBlood");
                return;
            }
            
            const latitude = parseFloat(updatedUserData.latitude);
            const longitude = parseFloat(updatedUserData.longitude);
            
            await sendMessageToFbUser(psId, `${updatedUserData.bloodGroup} রক্তের গ্রুপের দাতা খোঁজা হচ্ছে...`);
            
            try {
                const donors = await findNearAvailableDonor(latitude, longitude, updatedUserData.bloodGroup);
                
                if (donors && donors.length > 0) {
                    await sendMessageToFbUser(psId, `${donors.length} জন ${updatedUserData.bloodGroup} রক্তের গ্রুপের দাতা পাওয়া গেছে।`);
                    
                    // Send each donor as a separate message (max 5 to avoid spam)
                    for (let i = 0; i < Math.min(donors.length, 5); i++) {
                        const donorWithDistance = donors[i] as any;
                        await sendMessageToFbUser(
                            psId, 
                            `ডোনার নাম: ${donorWithDistance.fullName}\nরক্তের গ্রুপ: ${donorWithDistance.bloodGroup}\nআপনার থেকে দূরত্ব: ${donorWithDistance.distanceKm || 'অজানা'}\nযোগাযোগ করতে চাইলে এই নম্বরে যোগাযোগ করুন: ${donorWithDistance.phone}`
                        );
                        
                        // Add a small delay between messages
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                    if (donors.length > 5) {
                        await sendMessageToFbUser(psId, `এবং আরও ${donors.length - 5} জন রক্তদাতা রয়েছে।`);
                    }
                } else {
                    await sendMessageToFbUser(psId, "আপনার আশেপাশে ১৫ কিলোমিটার দূরত্বে কোনো রক্তদানকারী পাওয়া যায়নি।");
                }
            } catch (error) {
                console.error("Error searching for donors:", error);
                await sendMessageToFbUser(psId, "দুঃখিত, রক্তদাতা খোঁজার সময় একটি ত্রুটি ঘটেছে।");
            }
            
            // Clear user data after search
            userAdressMap.delete(psId);
            
            // Return to main menu
            await quickReply(psId, "আর কিছু করতে চান?", ["Find Blood", "Register"]);
            return;
        }
        
        // Handle cancel
        if (quickReplyType === "searchDonors" && (received_text === "Cancel" || received_text?.includes("Cancel"))) {
            console.log("Cancelling blood search");
            userAdressMap.delete(psId);
            await sendMessageToFbUser(psId, "রক্তদাতা খোঁজা বাতিল করা হয়েছে।");
            await quickReply(psId, "আপনি কি করতে চান?", ["Find Blood", "Register"]);
            return;
        }
        
        // If no condition was matched, try to handle the message based on user data
        const currentUserData = userAdressMap.get(psId);
        if (currentUserData && currentUserData.flowType === "findBlood") {
            if (!currentUserData.divisionId) {
                // If no division yet, treat as division selection
                await addressHandler(psId, "বিভাগ নির্বাচন করুন", received_text, "division");
                return;
            } else if (!currentUserData.districtId) {
                // If division but no district, treat as district selection
                await addressHandler(psId, "জেলা নির্বাচন করুন", received_text, "district");
                return;
            } else if (!currentUserData.thanaId) {
                // If district but no thana, treat as thana selection
                await addressHandler(psId, "থানা/উপজেলা নির্বাচন করুন", received_text, "thana");
                return;
            } else if (!currentUserData.bloodGroup) {
                // If we have location but no blood group, treat as blood group selection
                if (["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(received_text)) {
                    const updatedData = { ...currentUserData, bloodGroup: received_text };
                    userAdressMap.set(psId, updatedData);
                    await quickReply(
                        psId, 
                        "অবস্থান এবং রক্তের গ্রুপ সফলভাবে নির্বাচন করা হয়েছে! এখন কি করতে চান?", 
                        ["Search Donors", "Cancel"], 
                        "searchDonors"
                    );
                    return;
                }
            }
        }
        
    } catch (error) {
        console.error("Error in findBloodFromFb:", error);
        await sendMessageToFbUser(psId, "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
};

export default findBloodFromFb;