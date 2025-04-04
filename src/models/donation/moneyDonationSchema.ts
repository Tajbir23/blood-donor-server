import { model, Schema } from "mongoose";
import DonationType from "../../types/donationType";

const donationSchema = new Schema({
    tran_id: String,
    amount: Number,
    status: String,
    donor_name: String,
    donor_email: String,
    donor_phone: String,
    invoice_url: String,
    card_type: String,
    bank_tran_id: String,
    tran_date: String,
    currency: String,
    card_no: String,
    card_issuer: String,
    card_brand: String,
    card_issuer_country: String,
    
}, { timestamps: true });

const MoneyDonation = model<DonationType>("MoneyDonation", donationSchema);

export default MoneyDonation;
