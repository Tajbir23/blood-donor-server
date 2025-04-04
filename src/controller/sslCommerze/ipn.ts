import { Request, Response } from "express";

const ipn = async (req: Request, res: Response) => {    
    const paymentData = req.body;

    console.log(paymentData);
    
    res.send("IPN received");
}

export default ipn;
