import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";

const donation = async (req: Request, res: Response) => {
    console.log(req.body);
    const { amount, donor_name, donor_email, donor_phone } = req.body;

    const tran_id = uuidv4();

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
            return;
        }
        
        res.status(500).json({ message: "Server Error", error: apiResponse.GatewayPageURL });
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
        return;
    }
}

export default donation;