import findBloodFromFb from "./findBloodFromFb";
import hasAddressId from "./hasAddressId";
import hasBloodGroup from "./hasBloodGroup";
import quickReply from "./quickReply";

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

        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD" || quickReplyType === "findBlood") {
            // Starting the flow, no addressId needed
            await findBloodFromFb(psId, "Select division", undefined, quickReplyType);
            return;
        } else if (hasAddressId(received_text)) {
            // Pass the received_text as addressId and the addressType
            
            await findBloodFromFb(psId, "Select area", received_text, quickReplyType);
            return;
        } else if (hasBloodGroup(received_postback) || hasBloodGroup(received_text) || quickReplyType === "searchDonors") {
            await findBloodFromFb(psId, "Select blood group", received_text, quickReplyType, received_postback);
            return;
        }else {
            await quickReply(
                psId, 
                "Invalid input. Please try again.", 
                ["Find Blood", "Register"]
            );
            return;
        }
    } catch (error) {
        console.error("Error in handleFbBotMessage:", error);
        // We don't throw here to prevent app crashes
    }
}

export default handleFbBotMessage
