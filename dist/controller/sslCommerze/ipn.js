"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const paymentRoute_1 = require("../../router/paymentRoute");
const ipn = async (req, res) => {
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
        const sslcz = new sslcommerz_lts_1.default(paymentRoute_1.store_id || '', paymentRoute_1.store_passwd || '', paymentRoute_1.is_live);
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
        }
        else {
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
    }
    catch (error) {
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
exports.default = ipn;
