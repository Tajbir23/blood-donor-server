import { Request, Response } from "express";
import { is_live, paymentHistory, store_id, store_passwd } from "../../router/paymentRoute";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";

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
            res.status(200).json({url: apiResponse.GatewayPageURL});
            // res.redirect(apiResponse.GatewayPageURL);
            
            paymentHistory.set(tran_id, {
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
    } catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({ message: "Server Error", error });
        return;
    }
};

export default donation;