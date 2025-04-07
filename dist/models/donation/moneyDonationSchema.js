"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const donationSchema = new mongoose_1.Schema({
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
const MoneyDonation = (0, mongoose_1.model)("MoneyDonation", donationSchema);
exports.default = MoneyDonation;
