import { Request, Response } from "express";
// @ts-ignore
import SSLCommerz from "sslcommerz-lts";
import { is_live, store_id, store_passwd } from "../../router/paymentRoute";
import MoneyDonation from "../../models/donation/moneyDonationSchema";
import logger from "../../utils/logger";

const ipn = async (req: Request, res: Response) => {    
    const paymentData = req.body;
    try {
        const { val_id, tran_id, status } = paymentData;
        
        if (!val_id || !tran_id) {
            res.status(400).send("Invalid IPN data received");
            return;
        }
        
        // Initialize SSLCommerz instance for validation
        const sslcz = new SSLCommerz(store_id || '', store_passwd || '', is_live);
        
        // Validate the transaction using val_id
        const validation = await sslcz.validate({ val_id });
        
        if (validation.status === 'VALID') {
            // Update donation status in database
            await MoneyDonation.updateOne(
                { tran_id: tran_id },
                { 
                    status: status,
                    bank_tran_id: paymentData.bank_tran_id,
                    card_type: paymentData.card_type,
                    tran_date: paymentData.tran_date,
                }
            );
            logger.info(`IPN: Payment validated and updated for tran_id: ${tran_id}`);
            res.status(200).send("IPN processed successfully");
            return;
        } else {
            // Record failed validation in database
            await MoneyDonation.updateOne(
                { tran_id: tran_id },
                { status: 'VALIDATION_FAILED' }
            );
            logger.warn(`IPN: Payment validation failed for tran_id: ${tran_id}`);
            res.status(200).send("IPN validation failed");
            return;
        }
    } catch (error) {
        logger.error("IPN processing error:", error);
        // Always return 200 to SSLCommerz even if there's an error on our side
        res.status(200).send("IPN received with processing errors");
        return;
    }
};

export default ipn;
