import { Request, Response } from "express";

const cancelPayment = async (req: Request, res: Response) => {
    console.log("cancelPayment");
    try {
        // Extract transaction ID from the response
        const { tran_id } = req.body;
        
        // TODO: Update donation status in database to "cancelled"
        // Example: await donationModel.updateOne(
        //     { tranId: tran_id }, 
        //     { 
        //         status: 'cancelled', 
        //         paymentDetails: req.body 
        //     }
        // );
        
        // Redirect to cancellation page with transaction ID
        return res.redirect(`${process.env.FRONTEND_URL}/donation/cancelled?tran_id=${tran_id}`);
    } catch (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/donation/cancelled?reason=server_error`);
    }
};

export default cancelPayment;


