import mongoose from "mongoose";

interface DonationHistoryType {
    userId: mongoose.Types.ObjectId;
    donationDate: Date;
    recipient: string;
    recipientName: string;
}

export default DonationHistoryType;
