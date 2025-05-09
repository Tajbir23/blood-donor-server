import axios from "axios";
import retryWithBackoff from "../../utils/retryWithBackoff";


const quickReply = async (psId: string, title: string, replies: string[], type?: 'division' | 'district' | 'thana' | 'bloodGroup' | 'searchDonors' | 'cancel' | 'register' | 'registerComplete' | 'confirmDone' | "update_day" | "update_month" | "update_year" | "day_group1" | "day_group2" | "day_group3" | "day_group4") => {
    try {
        // Validate psId
        if (!psId || psId === "undefined") {
            console.error("Invalid PSID:", psId);
            return;
        }

        
        const response = await retryWithBackoff(() => 
            axios.post(
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
            )
        );
        
        console.log(`Quick reply sent successfully to ${psId}`);
        return response;
    } catch (error) {
        // Check for specific error types
        if (error.response?.data?.error?.code === 100) {
            console.error(`User not found: PSID ${psId} is invalid`);
        } else if (error.response?.data?.error?.code === 10) {
            console.error(`Permission denied: Missing messaging permissions`);
        } else if (error.response?.data?.error?.code === 105 && error.response?.data?.error?.message?.includes('has too many elements')) {
            console.error(`Too many quick replies: Maximum is 13 buttons per message`);
        } else {
            console.error("Error sending quick reply:", error.response?.data?.error || error.message);
        }
        
        // Don't throw the error - we want the app to continue running
        return null;
    }
}

export default quickReply;
