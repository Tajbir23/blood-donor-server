import axios from "axios";

const setupPersistentMenu = async () => {
    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        {
          persistent_menu: [
            {
              locale: "default",
              composer_input_disabled: false,
              call_to_actions: [
                {
                  type: "postback",
                  title: "Find Blood",
                  payload: "FIND_BLOOD",
                },
                {
                  type: "postback",
                  title: "Register",
                  payload: "REGISTER",
                },
                {
                  type: "postback",
                  title: "Update Last Donation Date",
                  payload: "UPDATE_LAST_DONATION_DATE",
                },
                {
                  type: "postback",
                  title: "Donate Blood",
                  payload: "DONATE_BLOOD",
                },
                {
                  type: "postback",
                  title: "Request for Blood",
                  payload: "REQUEST_FOR_BLOOD",
                }
              ],
            },
          ],
        }
      );
      console.log("✅ Persistent menu set successfully");
    } catch (error) {
      console.error("❌ Failed to set persistent menu:", error.response?.data || error);
    }
  };

export default setupPersistentMenu;