import addressHandler from "./addressHandler"
import hasAddressId from "./hasAddressId";
import quickReply from "./quickReply";

const handleFbBotMessage = async (received_text: string, received_postback: string, psId: string, addressType?: 'division' | 'district' | 'thana') => {
    console.log(received_text, received_postback, addressType)

    if (received_postback === "GET_STARTED_PAYLOAD") {
        await quickReply(
          psId,
          "👋 Welcome to LifeDrop! What would you like to do?",
          [
            JSON.stringify({ type: "main_menu", action: "FIND_BLOOD" }),
            JSON.stringify({ type: "main_menu", action: "REGISTER" }),
          ]
        );
      }

    if(received_text === "Find Blood" || received_postback === "FIND_BLOOD"){
        // Starting the flow, no addressId needed
        await addressHandler(psId, "Select division", undefined, addressType);
    }else if(hasAddressId(received_text)){
        // Pass the received_text as addressId and the addressType
        await addressHandler(psId, "Select area", received_text, addressType);
    }else {
        await quickReply(psId, "Invalid input. Please try again.", [
            "Find Blood",
            "Register"
          ]
        );
    }
}

export default handleFbBotMessage
