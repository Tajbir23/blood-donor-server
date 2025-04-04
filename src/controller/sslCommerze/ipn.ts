import { Request, Response } from "express";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";

const ipn = async (req: Request, res: Response) => {    
    const paymentData = req.body;
    console.log(paymentData);
    try {
        // Extract key payment information
        const { val_id, tran_id, status, amount, currency } = paymentData;
        
        if (!val_id || !tran_id) {
            res.status(400).send("Invalid IPN data received");
            return;
        }
        
        // Initialize SSLCommerz instance for validation
        const sslcz = new SSLCommerz(store_id || '', store_passwd || '', is_live);
        
        // Validate the transaction using val_id
        const validation = await sslcz.validate({ val_id });
        
        if (validation.status === 'VALID') {
            // TODO: Update donation status in database
            // Example:
            // await donationModel.updateOne(
            //     { tranId: tran_id },
            //     { 
            //         status: status, 
            //         paymentDetails: validation,
            //         updatedAt: new Date()
            //     }
            // );
            
            // Payment is valid, send success response
            res.status(200).send("IPN processed successfully");
            return;
        } else {
            // Payment validation failed
            // TODO: Record failed validation in database
            // Example:
            // await paymentLogModel.create({
            //     tranId: tran_id,
            //     status: 'VALIDATION_FAILED',
            //     data: paymentData,
            //     error: validation
            // });
            
            res.status(200).send("IPN validation failed");
            return;
        }
    } catch (error) {
        // TODO: Log the error for debugging
        // Example:
        // await paymentLogModel.create({
        //     data: paymentData,
        //     error: error.message,
        //     status: 'ERROR'
        // });
        
        // Always return 200 to SSLCommerz even if there's an error on our side
        res.status(200).send("IPN received with processing errors");
        return;
    }
};

export default ipn;
