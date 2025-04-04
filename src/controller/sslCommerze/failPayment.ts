import { Request, Response } from "express";

const failPayment = async (req: Request, res: Response) => {
    console.log("failPayment");
    try {
        const { tran_id, error, status } = req.body;
        
        console.log(req.body);
        // TODO: Update donation status in database to "failed"
        // Example: await donationModel.updateOne(
        //     { tranId: tran_id }, 
        //     { 
        //         status: 'failed', 
        //         paymentDetails: req.body 
        //     }
        // );
        
        // Redirect to failure page with transaction ID and reason
        const errorReason = error || "payment_failed";
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?tran_id=${tran_id}&reason=${errorReason}`);
    } catch (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};

export default failPayment;


