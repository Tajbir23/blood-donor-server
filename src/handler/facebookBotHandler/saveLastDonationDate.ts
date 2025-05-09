import FbUserModel from "../../models/user/fbUserSchema";

const saveLastDonationDate = async (psId: string, year: string, month: string, day: string) => {
    console.log("Save last donation", {year, month, day})
  const user = await FbUserModel.findOne({ psId: psId });
  const months = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12",
  };

  const monthNumber = months[month];
  const date = `${year}-${monthNumber}-${day}`;
  console.log("Date", date)
  user.lastDonationDate = new Date(date);
  await user.save();
  
};

export default saveLastDonationDate;
