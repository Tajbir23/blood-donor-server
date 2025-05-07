import { Request, Response } from "express";
import handleFbBotMessage from "../../handler/facebookBotHandler/handleFbBotMessage";

const chatBot = async (req: Request, res: Response) => {
    const body = req.body;

    if(body.object === "page"){
        body.entry.forEach(async (entry: any) => {
            const webhookEvent = entry.messaging[0];
            const psId = webhookEvent.sender.id;

            const quickReply = webhookEvent.message?.quick_reply?.payload;
            
            let quickReplyData;
            
            if(quickReply){
                quickReplyData = JSON.parse(quickReply);
            }

            if(webhookEvent.message || webhookEvent.postback){
                const received_text = webhookEvent.message?.text;
                const received_postback = webhookEvent.postback?.payload;

                if(received_text || received_postback){
                    
                    await handleFbBotMessage(received_text, received_postback, psId, quickReplyData?.type);
                }
            }
        });
    }

    res.sendStatus(200);
}

export default chatBot;