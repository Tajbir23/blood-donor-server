import userModel from "../../models/user/userSchema";
import fbBotBaseUrl from "./botBaseUrl";

const registerHandler = async(psId: string, title: string, replies: string) => {
    const user = await userModel.findOne({ fbId: psId });
    if (!user) {
        await axios.post(fbBotBaseUrl, {
            recipient: {id: psId},
            message: {
                text: "You are already registered"
            }
        })

        return
    }
    
    // register user in database
}

export default registerHandler;
