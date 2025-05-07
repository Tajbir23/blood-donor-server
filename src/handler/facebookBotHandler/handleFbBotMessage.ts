import addressHandler from "./addressHandler"
import hasAddressId from "./hasAddressId";
import quickReply from "./quickReply";

const handleFbBotMessage = async (received_text: string, received_postback: string, psId: string, addressType?: 'division' | 'district' | 'thana') => {
    try {
        console.log("Handling message:", received_text, received_postback, "type:", addressType, "for PSID:", psId);
        
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

        if (received_text === "Find Blood" || received_postback === "FIND_BLOOD") {
            // Starting the flow, no addressId needed
            await addressHandler(psId, "Select division", undefined, addressType);
            return;
        } else if (hasAddressId(received_text)) {
            // Pass the received_text as addressId and the addressType
            await addressHandler(psId, "Select area", received_text, addressType);
            return;
        } else {
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
