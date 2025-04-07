"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentRoute_1 = require("../../router/paymentRoute");
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
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
            res.status(200).json({ url: apiResponse.GatewayPageURL });
            // res.redirect(apiResponse.GatewayPageURL);
            paymentRoute_1.paymentHistory.set(tran_id, {
                donor_name: donor_name,
                donor_email: donor_email,
                donor_phone: donor_phone,
                amount: amount,
            });
            return;
        }
        console.log(apiResponse);
        res.status(500).json({ message: "Server Error", error: apiResponse.GatewayPageURL });
        return;
    }
    catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({ message: "Server Error", error });
        return;
    }
};
exports.default = donation;
