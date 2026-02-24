import { Request, Response } from "express";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";
import MoneyDonation from "../../models/donation/moneyDonationSchema";
import sendEmail from "../email/sendEmail";
import logger from "../../utils/logger";

const successPayment = async (req: Request, res: Response) => {
    try {
        
        const { val_id, tran_id, amount, status } = req.body;

        if (!val_id || !tran_id) {
            res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=invalid_data`);
            return;
        }

        

        // SSLCommerz ইনিশিয়ালাইজ করা
        const sslcz = new SSLCommerz(store_id, store_passwd, is_live);

        // ট্রানজেকশন ভ্যালিডেট করা
        const validation = await sslcz.validate({ val_id });
        

        if (validation.status === "VALID") {
            // ইনভয়েস ডেটা তৈরি
            const invoiceData = {
                store_id: store_id,
                store_passwd: store_passwd,
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
            const invoiceBaseUrl = is_live
                ? "https://securepay.sslcommerz.com/gwprocess/v4/invoice.php"
                : "https://sandbox.sslcommerz.com/gwprocess/v4/invoice.php";

            // URL-encoded ফর্ম্যাটে ডেটা তৈরি
            const formData = new URLSearchParams();
            for (const key in invoiceData) {
                formData.append(key, invoiceData[key as keyof typeof invoiceData]);
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
            logger.info(`Invoice generated for tran_id: ${tran_id}`, result);

            // ডাটাবেস থেকে pending donation রেকর্ড আপডেট করা
            const donation = await MoneyDonation.findOneAndUpdate(
                { tran_id: tran_id },
                {
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
                },
                { new: true }
            );

            if (!donation) {
                logger.error(`No pending donation found for tran_id: ${tran_id}`);
                return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=record_not_found`);
            }

            await sendEmail({
                email: donation.donor_email,
                subject: "আপনার অর্থ অনুদান সফল ভাবে হয়েছে",
                templateType: "moneyDonation",
                templateData: {
                    donorName: donation.donor_name,
                    tranId: tran_id,
                    amount: amount,
                    invoiceUrl: `${process.env.BACKEND_URL}/api/payment/invoice/${tran_id}`,
                }
            })

            const invoiceUrl = `${process.env.BACKEND_URL}/api/payment/invoice/${tran_id}`;
            // সাকসেস পেজে রিডাইরেক্ট
            return res.redirect(
                `${process.env.FRONTEND_URL}/donation/success?tran_id=${tran_id}&amount=${amount}&invoice_url=${encodeURIComponent(invoiceUrl)}`
            );
        } else {
            return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=validation_failed&tran_id=${tran_id}`);
        }
    } catch (error) {
        logger.error("successPayment error:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};

export default successPayment;