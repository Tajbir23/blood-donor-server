import axios from "axios";

const quickReply = async (psId: string, title: string, replies: string[], type?: 'division' | 'district' | 'thana') => {
    await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        {
          recipient: { id: psId },
          message: {
            text: title,
            quick_replies: replies.map(label => ({
              content_type: "text",
              title: label,
              payload: JSON.stringify({
                type: type,
                payload: label
              }),
            }))
          }
        }
      );
}

export default quickReply;
