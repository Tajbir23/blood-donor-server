import { Request, Response } from "express";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";

const successPayment = async (req: Request, res: Response) => {
    try {
        // Log transaction data
        console.log("Payment Success Data:", req.body);
        
        const { val_id, tran_id, amount, status } = req.body;
        
        if (!val_id || !tran_id) {
            return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=invalid_data`);
        }
        
        // Initialize SSLCommerz
        const sslcz = new SSLCommerz(store_id, store_passwd, is_live);
        
        // Validate the transaction
        const validation = await sslcz.validate({ val_id });
        
        if (validation.status === 'VALID') {
            // TODO: Update donation status in database
            // Example: await donationModel.updateOne(
            //     { tranId: tran_id }, 
            //     { status: 'completed', paymentDetails: validation }
            // );
            
            // Redirect to success page with transaction ID
            return res.redirect(`${process.env.FRONTEND_URL}/donation/success?tran_id=${tran_id}&amount=${amount}`);
        } else {
            console.error("Payment validation failed:", validation);
            return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=validation_failed&tran_id=${tran_id}`);
        }
    } catch (error) {
        console.error("Success payment processing error:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};

export default successPayment;

