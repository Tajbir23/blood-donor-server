"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const paymentRoute_1 = require("../../router/paymentRoute");
const moneyDonationSchema_1 = __importDefault(require("../../models/donation/moneyDonationSchema"));
const sendEmail_1 = __importDefault(require("../email/sendEmail"));
const logger_1 = __importDefault(require("../../utils/logger"));
const successPayment = async (req, res) => {
    try {
        const { val_id, tran_id, amount, status } = req.body;
        if (!val_id || !tran_id) {
            res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=invalid_data`);
            return;
        }
        // SSLCommerz ইনিশিয়ালাইজ করা
        const sslcz = new sslcommerz_lts_1.default(paymentRoute_1.store_id, paymentRoute_1.store_passwd, paymentRoute_1.is_live);
        // ট্রানজেকশন ভ্যালিডেট করা
        const validation = await sslcz.validate({ val_id });
        if (validation.status === "VALID") {
            // ইনভয়েস ডেটা তৈরি
            const invoiceData = {
                store_id: paymentRoute_1.store_id,
                store_passwd: paymentRoute_1.store_passwd,
                refer: "5B1F9DE4D82B6",
                total_amount: amount,
                currency: "BDT",
                tran_id: tran_id,
                cus_name: req.body.cus_name || "Donor",
                cus_email: req.body.cus_email || "donor@example.com",
                cus_phone: req.body.cus_phone || "",
                product_name: "Blood Donation",
                product_category: "Donation",
                is_sent_email: "yes"
            };
            // ইনভয়েস ডেটা লগ করা
            // ইনভয়েস জেনারেশনের জন্য বেস URL
            const invoiceBaseUrl = paymentRoute_1.is_live
                ? "https://securepay.sslcommerz.com/gwprocess/v4/invoice.php"
                : "https://sandbox.sslcommerz.com/gwprocess/v4/invoice.php";
            // URL-encoded ফর্ম্যাটে ডেটা তৈরি
            const formData = new URLSearchParams();
            for (const key in invoiceData) {
                formData.append(key, invoiceData[key]);
            }
            // fetch দিয়ে POST রিকোয়েস্ট পাঠানো
            const response = await fetch(invoiceBaseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });
            // রেসপন্স পড়া
            const result = await response.json();
            logger_1.default.info(`Invoice generated for tran_id: ${tran_id}`, result);
            // ডাটাবেস থেকে pending donation রেকর্ড আপডেট করা
            const donation = await moneyDonationSchema_1.default.findOneAndUpdate({ tran_id: tran_id }, {
                status: status,
                invoice_url: `${process.env.BACKEND_URL}/api/payment/invoice/${tran_id}`,
                card_type: req.body.card_type,
                bank_tran_id: req.body.bank_tran_id,
                tran_date: req.body.tran_date,
                currency: req.body.currency,
                card_no: req.body.card_no,
                card_issuer: req.body.card_issuer,
                card_brand: req.body.card_brand,
                card_issuer_country: req.body.card_issuer_country,
            }, { new: true });
            if (!donation) {
                logger_1.default.error(`No pending donation found for tran_id: ${tran_id}`);
                return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=record_not_found`);
            }
            await (0, sendEmail_1.default)({
                email: donation.donor_email,
                subject: "আপনার অর্থ অনুদান সফল ভাবে হয়েছে",
                templateType: "moneyDonation",
                templateData: {
                    donorName: donation.donor_name,
                    tranId: tran_id,
                    amount: amount,
                    invoiceUrl: `${process.env.BACKEND_URL}/api/payment/invoice/${tran_id}`,
                }
            });
            const invoiceUrl = `${process.env.BACKEND_URL}/api/payment/invoice/${tran_id}`;
            // সাকসেস পেজে রিডাইরেক্ট
            return res.redirect(`${process.env.FRONTEND_URL}/donation/success?tran_id=${tran_id}&amount=${amount}&invoice_url=${encodeURIComponent(invoiceUrl)}`);
        }
        else {
            return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=validation_failed&tran_id=${tran_id}`);
        }
    }
    catch (error) {
        logger_1.default.error("successPayment error:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};
exports.default = successPayment;
