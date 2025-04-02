import mongoose, { model } from "mongoose";
import DonationHistoryType from "../../types/donationHistoryType";

const donationHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    donationDate: {
        type: Date,
        required: true
    },
    recipient: {
        type: String,
    },
    recipientName: {
        type: String,
    }
},{
    timestamps: true
});

const donationHistoryModel = model<DonationHistoryType>("DonationHistory", donationHistorySchema)
export default donationHistoryModel
