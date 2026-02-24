"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentRoute_1 = require("../../router/paymentRoute");
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const moneyDonationSchema_1 = __importDefault(require("../../models/donation/moneyDonationSchema"));
const logger_1 = __importDefault(require("../../utils/logger"));
const donation = async (req, res) => {
    const { amount, donor_name, donor_email, donor_phone } = req.body;
    const tran_id = `REF-${Date.now()}`;
    const data = {
        total_amount: amount,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `${process.env.BACKEND_URL}/api/payment/success`,
        fail_url: `${process.env.BACKEND_URL}/api/payment/fail`,
        cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel`,
        ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
        cus_name: donor_name,
        cus_email: donor_email,
        cus_phone: donor_phone,
        cus_add1: "Dhaka",
        product_name: "Blood Donation",
        product_category: "Donation",
        product_profile: "general",
        shipping_method: "NO",
    };
    const sslc = new sslcommerz_lts_1.default(paymentRoute_1.store_id, paymentRoute_1.store_passwd, paymentRoute_1.is_live);
    try {
        const apiResponse = await sslc.init(data);
        if (apiResponse.GatewayPageURL) {
            // Create a pending donation record in DB (persistent, survives server restarts)
            await moneyDonationSchema_1.default.create({
                tran_id,
                amount,
                status: 'PENDING',
                donor_name,
                donor_email,
                donor_phone,
                currency: 'BDT',
            });
            res.status(200).json({ url: apiResponse.GatewayPageURL });
            return;
        }
        logger_1.default.error("SSLCommerz init failed:", apiResponse);
        res.status(500).json({ message: "Payment gateway error" });
        return;
    }
    catch (error) {
        logger_1.default.error("Payment processing error:", error);
        res.status(500).json({ message: "Server Error", error });
        return;
    }
};
exports.default = donation;
