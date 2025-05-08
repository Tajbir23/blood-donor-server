import axios from "axios";
import fbBotBaseUrl from "./botBaseUrl";

const sendMessageToFbUser = async (psId: string, message: string) => {
    try {
        await axios.post(fbBotBaseUrl, {
            recipient: {
                id: psId
            },
            message: {
                text: message
            }
        });
    } catch (error) {
        console.error(error);
    }
}

export default sendMessageToFbUser;
