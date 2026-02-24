import { Request, Response } from "express";
import MoneyDonation from "../../models/donation/moneyDonationSchema";
import logger from "../../utils/logger";

const failPayment = async (req: Request, res: Response) => {
    try {
        const { tran_id, error, status } = req.body;
        
        // Update donation status in database to "failed"
        if (tran_id) {
            await MoneyDonation.updateOne(
                { tran_id: tran_id },
                { status: status || 'FAILED' }
            );
            logger.info(`Payment failed for tran_id: ${tran_id}, reason: ${error || 'unknown'}`);
        }
        
        const errorReason = error || "payment_failed";
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?tran_id=${tran_id}&reason=${errorReason}`);
    } catch (err) {
        logger.error("Error processing failed payment:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};

export default failPayment;


