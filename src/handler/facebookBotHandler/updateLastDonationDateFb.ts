import quickReply from "./quickReply";
import updateLastDonationMapFb from "./updateLastDonationMapFb";
import sendMessageToFbUser from "./sendMessageToFbUser";
import FbUserModel from "../../models/user/fbUserSchema";
import saveLastDonationDate from "./saveLastDonationDate";

export default async function updateLastDonationDateFb(
  psId: string,
  text: string,
  type: string,
  receivedText: string,
  receivedPostback: string
) {
  const isUserExists = await FbUserModel.findOne({ psId: psId });
  if (!isUserExists) {
    await sendMessageToFbUser(psId, "আপনি আমাদের বেবহারকারি নন। আপনার প্রথম রক্তদানের তারিখ সংরক্ষণ করতে পারবেন না। আপনাকে প্রথমে নিবন্ধন করতে হবে।");
    await quickReply(psId, "নিবন্ধন করতে Register বাটনে ক্লিক করুন", ["Register"], "register");
    return;
  }
  try {
    let lastDonationData = updateLastDonationMapFb.get(psId) || {};

    if (type === "first_call") {
      updateLastDonationMapFb.set(psId, { flowType: "update_year" });
      
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = 0; i < 5; i++) {
        years.push((currentYear - i).toString());
      }

      await quickReply(psId, "আপনি শেষ কবে রক্ত দান করেছেন? প্রথমে বছর নির্বাচন করুন:", years, "update_year");
      return;
    }

    if (type === "update_year") {
      // Year is selected, save it and ask for month
      lastDonationData.year = receivedText;
      lastDonationData.flowType = "update_month";
      updateLastDonationMapFb.set(psId, lastDonationData);
      
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      await quickReply(psId, "মাস নির্বাচন করুন:", months, "update_month");
      return;
    }

    if (type === "update_month") {
      // Month is selected, save it and ask for day (group 1)
      lastDonationData.month = receivedText;
      lastDonationData.flowType = "day_group1";
      updateLastDonationMapFb.set(psId, lastDonationData);
      
      // Days 1-8 plus More button
      const daysGroup1 = ["1", "2", "3", "4", "5", "6", "7", "8", "More days..."];
      await quickReply(psId, "দিন নির্বাচন করুন:", daysGroup1, "day_group1");
      return;
    }

    if (type === "day_group1") {
      if (receivedText === "More days...") {
        // User wants to see more days
        lastDonationData.flowType = "day_group2";
        updateLastDonationMapFb.set(psId, lastDonationData);
        
        // Days 9-16 plus More button
        const daysGroup2 = ["9", "10", "11", "12", "13", "14", "15", "16", "More days..."];
        await quickReply(psId, "দিন নির্বাচন করুন:", daysGroup2, "day_group2");
        return;
      } else {
        // Day is selected from group 1
        lastDonationData.day = receivedText;
        updateLastDonationMapFb.delete(psId); // Clear data after saving
        
        // Save the date to the user's profile in the database
        await saveLastDonationDate(psId, lastDonationData.year, lastDonationData.month, receivedText);
        await sendMessageToFbUser(psId, 
          `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`
        );
        return;
      }
    }

    if (type === "day_group2") {
      if (receivedText === "More days...") {
        // User wants to see more days
        lastDonationData.flowType = "day_group3";
        updateLastDonationMapFb.set(psId, lastDonationData);
        
        // Days 17-24 plus More button
        const daysGroup3 = ["17", "18", "19", "20", "21", "22", "23", "24", "More days..."];
        await quickReply(psId, "দিন নির্বাচন করুন:", daysGroup3, "day_group3");
        return;
      } else {
        // Day is selected from group 2
        lastDonationData.day = receivedText;
        updateLastDonationMapFb.delete(psId); // Clear data after saving
        
        // Save the date to the user's profile in the database
        await saveLastDonationDate(psId, lastDonationData.year, lastDonationData.month, receivedText);
        
        await sendMessageToFbUser(psId, 
          `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`
        );
        return;
      }
    }

    if (type === "day_group3") {
      if (receivedText === "More days...") {
        // User wants to see more days
        lastDonationData.flowType = "day_group4";
        updateLastDonationMapFb.set(psId, lastDonationData);
        
        // Days 25-31
        const daysGroup4 = ["25", "26", "27", "28", "29", "30", "31"];
        await quickReply(psId, "দিন নির্বাচন করুন:", daysGroup4, "day_group4");
        return;
      } else {
        // Day is selected from group 3
        lastDonationData.day = receivedText;
        updateLastDonationMapFb.delete(psId); // Clear data after saving
        
        // Save the date to the user's profile in the database
        await saveLastDonationDate(psId, lastDonationData.year, lastDonationData.month, receivedText);
        
        await sendMessageToFbUser(psId, 
          `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`
        );
        return;
      }
    }

    if (type === "day_group4") {
      // Day is selected from group 4
      lastDonationData.day = receivedText;
      updateLastDonationMapFb.delete(psId); // Clear data after saving
      
      // Save the date to the user's profile in the database
      await saveLastDonationDate(psId, lastDonationData.year, lastDonationData.month, receivedText);
      
      await sendMessageToFbUser(psId, 
        `আপনার শেষ রক্তদানের তারিখ ${receivedText} ${lastDonationData.month}, ${lastDonationData.year} হিসাবে সংরক্ষণ করা হয়েছে। ধন্যবাদ!`
      );
      return;
    }

    // If we get here, something went wrong
    console.error("Unhandled donation flow type:", type);
    await quickReply(
      psId,
      "দুঃখিত, কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
      ["Update Last Donation"]
    );

  } catch (error) {
    console.error("Error in updateLastDonationDateFb:", error);
    await sendMessageToFbUser(psId, "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
}

// Helper function to convert month name to number
function getMonthNumber(monthName: string): string {
  const months = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
  };
  
  return months[monthName as keyof typeof months] || "01"; // Default to 01 if not found
}
