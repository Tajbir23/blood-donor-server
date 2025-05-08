import { userAdressMap, getDivision, getDistrict, getThana } from "./address";
import quickReply from "./quickReply";
import hasAddressId from "./hasAddressId";
import sendMessageToFbUser from "./sendMessageToFbUser";

interface UserAddressData {
    divisionId?: string;
    districtId?: string;
    thanaId?: string;
    latitude?: string;
    longitude?: string;
    bloodGroup?: string;
    fullName?: string;
    flowType?: "register" | "findBlood";
}

const addressHandler = async (psId: string, title: string, selectedId?: string, quickReplyType?: string) => {
    try {
        console.log("Address Handler:", { psId, title, selectedId, quickReplyType });
        
        // Get current user data or initialize
        let userData = userAdressMap.get(psId) || {
            divisionId: "",
            districtId: "",
            thanaId: "",
            latitude: "",
            longitude: "",
            flowType: undefined as "register" | "findBlood" | undefined
        } as UserAddressData;
        
        // Determine the flow type - this is critical for routing messages correctly
        if (quickReplyType === "findBlood" || quickReplyType?.includes("find")) {
            userData.flowType = "findBlood";
        } else if (!userData.flowType) {
            userData.flowType = "register"; // Default to register if no flow type specified
        }
        
        // Add debug logging to see what flow we're in
        console.log(`AddressHandler for ${psId} - Flow: ${userData.flowType}`);
        
        // Always save the flow type to ensure it's preserved
        userAdressMap.set(psId, userData);
        
        // Handle initial state - show divisions
        if (!selectedId) {
            const divisions = await getDivision();
            await quickReply(
                psId, 
                title, 
                divisions.map(div => div.id),
                // Preserve the flow type in the quickReplyType
                userData.flowType === "findBlood" ? "division" : "division"
            );
            return;
        }
        
        // Handle division selection
        if (quickReplyType === "division") {
            // Save division ID while preserving flow type
            userData.divisionId = selectedId;
            userAdressMap.set(psId, userData);
            
            // Get districts for selected division
            const districts = await getDistrict(selectedId);
            
            // Send quick reply with districts
            await quickReply(
                psId, 
                "জেলা নির্বাচন করুন", 
                districts.map(district => district.id),
                "district"
            );
            return;
        }
        
        // Handle district selection
        if (quickReplyType === "district") {
            // Save district ID while preserving flow type
            userData.districtId = selectedId;
            userAdressMap.set(psId, userData);
            
            // Get thanas for selected district
            const thanas = await getThana(selectedId, userData.divisionId);
            
            // Send quick reply with thanas
            await quickReply(
                psId, 
                "থানা/উপজেলা নির্বাচন করুন", 
                thanas.map(thana => thana.id),
                "thana"
            );
            return;
        }
        
        // Handle thana selection 
        if (quickReplyType === "thana") {
            // Get thanas to find the one with matching ID
            const thanas = await getThana(userData.districtId, userData.divisionId);
            const selectedThana = thanas.find(thana => thana.id === selectedId);
            
            if (selectedThana) {
                // Update user data with thana info while preserving flow type
                userData.thanaId = selectedId;
                userData.latitude = selectedThana.latitude;
                userData.longitude = selectedThana.longitude;
                userAdressMap.set(psId, userData);
                
                // Success message
                await sendMessageToFbUser(
                    psId, 
                    `ঠিকানা সংরক্ষণ করা হয়েছে: ${userData.divisionId}, ${userData.districtId}, ${userData.thanaId}`
                );
                
                console.log(`Saved address for ${psId}:`, userData);
            } else {
                // Error message if thana not found
                await sendMessageToFbUser(
                    psId, 
                    "দুঃখিত, আপনার নির্বাচিত এলাকা খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
                );
                
                // Restart with divisions
                const divisions = await getDivision();
                await quickReply(
                    psId, 
                    "আপনার বিভাগ নির্বাচন করুন:", 
                    divisions.map(div => div.id),
                    "division"
                );
            }
            return;
        }
        
        // For any direct address ID (fallback)
        if (hasAddressId(selectedId)) {
            // Try to determine what level we're at based on current user data
            if (!userData.divisionId) {
                // Division selection while preserving flow type
                userData.divisionId = selectedId;
                userAdressMap.set(psId, userData);
                
                const districts = await getDistrict(selectedId);
                await quickReply(
                    psId, 
                    "জেলা নির্বাচন করুন", 
                    districts.map(district => district.id),
                    "district"
                );
                return;
            } else if (!userData.districtId) {
                // District selection while preserving flow type
                userData.districtId = selectedId;
                userAdressMap.set(psId, userData);
                
                const thanas = await getThana(selectedId, userData.divisionId);
                await quickReply(
                    psId, 
                    "থানা/উপজেলা নির্বাচন করুন", 
                    thanas.map(thana => thana.id),
                    "thana"
                );
                return;
            } else if (!userData.thanaId) {
                // Thana selection while preserving flow type
                const thanas = await getThana(userData.districtId, userData.divisionId);
                const selectedThana = thanas.find(thana => thana.id === selectedId);
                
                if (selectedThana) {
                    userData.thanaId = selectedId;
                    userData.latitude = selectedThana.latitude;
                    userData.longitude = selectedThana.longitude;
                    userAdressMap.set(psId, userData);
                    
                    await sendMessageToFbUser(
                        psId, 
                        `ঠিকানা সংরক্ষণ করা হয়েছে: ${userData.divisionId}, ${userData.districtId}, ${userData.thanaId}`
                    );
                    
                    console.log(`Saved address for ${psId}:`, userData);
                } else {
                    await sendMessageToFbUser(
                        psId, 
                        "দুঃখিত, আপনার নির্বাচিত এলাকা খুঁজে পাওয়া যায়নি।"
                    );
                }
                return;
            }
        }
        
    } catch (error) {
        console.error("Error in addressHandler:", error);
        await sendMessageToFbUser(
            psId, 
            "দুঃখিত, আপনার ঠিকানা সংরক্ষণ করার সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
    }
};

export default addressHandler;