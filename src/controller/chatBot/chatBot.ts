import { Request, Response } from "express";
import handleFbBotMessage from "../../handler/facebookBotHandler/handleFbBotMessage";

const chatBot = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        if (!body || !body.object) {
            console.log("Invalid request body", body);
            res.sendStatus(400);
            return
        }

        if (body.object === "page") {
            if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
                console.log("Missing entry array in webhook payload");
                res.sendStatus(200); // Still return 200 to acknowledge receipt
                return;
            }

            for (const entry of body.entry) {
                if (!entry.messaging || !Array.isArray(entry.messaging) || entry.messaging.length === 0) {
                    console.log("Missing messaging array in entry");
                    continue;
                }

                const webhookEvent = entry.messaging[0];
                const psId = webhookEvent.sender?.id;

                if (!psId) {
                    console.log("Missing sender ID in webhook event");
                    continue;
                }

                const quickReply = webhookEvent.message?.quick_reply?.payload;
                
                let quickReplyData = null;
                let quickReplyType = null;
                
                if (quickReply) {
                    try {
                        quickReplyData = JSON.parse(quickReply);
                        quickReplyType = quickReplyData?.type;
                    } catch (error) {
                        console.error("Error parsing quick reply payload:", error);
                    }
                }

                const received_text = webhookEvent.message?.text;
                const received_postback = webhookEvent.postback?.payload;

                if (received_text || received_postback) {
                    await handleFbBotMessage(received_text, received_postback, psId, quickReplyType);
                }
            }
        }

        res.sendStatus(200);
        return
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(200); // Still return 200 to acknowledge receipt
        return
    }
}

export default chatBot;