import axios from "axios";
import fbBotBaseUrl from "./botBaseUrl";

/**
 * Send a simple text message to a Facebook user
 */
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
        console.error("Error sending simple message:", error);
    }
};

/**
 * Send a message with a URL button to a Facebook user
 */
const sendUrlButtonToFbUser = async (psId: string, message: string, buttonText: string, url: string) => {
    try {
        await axios.post(fbBotBaseUrl, {
            recipient: {
                id: psId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: message,
                        buttons: [
                            {
                                type: "web_url",
                                url: url,
                                title: buttonText,
                                webview_height_ratio: "full"
                            }
                        ]
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error sending URL button:", error);
    }
};

/**
 * Send a generic template with multiple URL buttons
 */
const sendGenericTemplate = async (psId: string, elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons: Array<{
        title: string;
        url: string;
    }>;
}>) => {
    try {
        await axios.post(fbBotBaseUrl, {
            recipient: {
                id: psId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements.map(element => ({
                            title: element.title,
                            subtitle: element.subtitle || "",
                            image_url: element.image_url,
                            buttons: element.buttons.map(button => ({
                                type: "web_url",
                                url: button.url,
                                title: button.title,
                                webview_height_ratio: "full"
                            }))
                        }))
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error sending generic template:", error);
    }
};

export { sendUrlButtonToFbUser, sendGenericTemplate };
export default sendMessageToFbUser;
