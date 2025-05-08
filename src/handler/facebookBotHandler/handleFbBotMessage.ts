import findBloodFromFb from "./findBloodFromFb";
import hasAddressId from "./hasAddressId";
import hasBloodGroup from "./hasBloodGroup";
import quickReply from "./quickReply";
import registerFbUser from "./registerFbUser";
import { userAdressMap } from "./address";

// Define a basic interface for what we know the user data could contain
interface UserData {
    divisionId?: string;
    districtId?: string;
    thanaId?: string;
    latitude?: string;
    longitude?: string;
    bloodGroup?: string;
    fullName?: string;
    flowType?: "register" | "findBlood";
}

const handleFbBotMessage = async (received_text: string, received_postback: string, psId: string, quickReplyType?: string) => {
    try {
        console.log("Handling message:", received_text, received_postback, "type:", quickReplyType, "for PSID:", psId);
        
        // Validate PSID
        if (!psId || psId === "undefined") {
            console.error("Invalid PSID received:", psId);
            return;
        }

        if (received_postback === "GET_STARTED_PAYLOAD") {
            await quickReply(
                psId,
                "👋 Welcome to LifeDrop! What would you like to do?",
                ["Find Blood", "Register"]
            );
            return;
        }
        
        // Get current user data if any
        const userData = userAdressMap.get(psId) as UserData || {};
        
        // Check for explicit Find Blood or FIND_BLOOD first
        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD") {
            console.log("Detected explicit Find Blood request");
            await findBloodFromFb(psId, "", received_text, "findBlood", received_postback);
            return;
        }
        
        // Then handle Search Donors reply specifically
        if (quickReplyType === "searchDonors" || received_text === "Search Donors" || received_text?.includes("Donors")) {
            console.log("Detected Search Donors request");
            await findBloodFromFb(psId, "", received_text, "searchDonors", received_postback);
            return;
        }
        
        // If we're already in the findBlood flow, keep routing to findBloodFromFb
        if (userData.flowType === "findBlood") {
            console.log("Continuing Find Blood flow based on stored user data");
            await findBloodFromFb(psId, "Select area", received_text, quickReplyType || "", received_postback);
            return;
        }

        // First check for registration flow - include all registration-related quickReplyTypes or check flowType
        if (received_text === "Register" || received_postback === "REGISTER" || 
            quickReplyType === "register" || quickReplyType === "registerComplete" || 
            quickReplyType === "confirmDone" ||
            userData.flowType === "register" ||
            (quickReplyType === "bloodGroup" && !received_text?.match(/Find|Search/))) {
            console.log("Routing to registration flow");
            await registerFbUser(psId, received_text, received_postback, quickReplyType);
            return;
        }
        
        // Then handle Find Blood flow for quickReply responses
        if (quickReplyType === "division" || quickReplyType === "district" || 
            quickReplyType === "thana" || quickReplyType === "bloodGroup") {
            console.log("Routing to Find Blood flow based on quickReplyType:", quickReplyType);
            await findBloodFromFb(psId, "Select area", received_text, quickReplyType, received_postback);
            return;
        }
        
        // Handle direct address IDs without explicit quickReplyType
        if (hasAddressId(received_text)) {
            // If flowType is explicitly set to register, route to register
            if (userData.flowType === "register") {
                console.log("Routing address ID to registration");
                await registerFbUser(psId, received_text, received_postback, "addressId");
            } else {
                // Default to findBlood for address IDs
                console.log("Routing address ID to Find Blood");
                await findBloodFromFb(psId, "Select area", received_text, "addressId", received_postback);
            }
            return;
        }
        
        // Check for blood groups without explicit quickReplyType
        if (hasBloodGroup(received_text)) {
            if (userData.flowType === "findBlood" && userData.thanaId) {
                console.log("Detected blood group in Find Blood flow");
                await findBloodFromFb(psId, "", received_text, "bloodGroup", "");
                return;
            } else if (userData.flowType === "register") {
                console.log("Detected blood group in Register flow");
                await registerFbUser(psId, received_text, "", "bloodGroup");
                return;
            }
        }
        
        // Default to the main menu if we can't determine the flow
        console.log("No matching condition found, showing default menu");
        await quickReply(
            psId, 
            "আমি আপনাকে বুঝতে পারিনি। আবার চেষ্টা করুন।", 
            ["Find Blood", "Register"]
        );
        return;
    } catch (error) {
        console.error("Error in handleFbBotMessage:", error);
        // We don't throw here to prevent app crashes
    }
}

export default handleFbBotMessage
