import { Request, Response } from "express";
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";
import MoneyDonation from "../../models/donation/moneyDonationSchema";
import logger from "../../utils/logger";

const donation = async (req: Request, res: Response) => {
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

    const sslc = new SSLCommerz(store_id, store_passwd, is_live);

    try {
        const apiResponse = await sslc.init(data);
        if(apiResponse.GatewayPageURL) {
            // Create a pending donation record in DB (persistent, survives server restarts)
            await MoneyDonation.create({
                tran_id,
                amount,
                status: 'PENDING',
                donor_name,
                donor_email,
                donor_phone,
                currency: 'BDT',
            });

            res.status(200).json({url: apiResponse.GatewayPageURL});
            return;
        }

        logger.error("SSLCommerz init failed:", apiResponse);
        res.status(500).json({ message: "Payment gateway error" });
        return;
    } catch (error) {
        logger.error("Payment processing error:", error);
        res.status(500).json({ message: "Server Error", error });
        return;
    }
};

export default donation;