"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const paymentRoute_1 = require("../../router/paymentRoute");
const moneyDonationSchema_1 = __importDefault(require("../../models/donation/moneyDonationSchema"));
const logger_1 = __importDefault(require("../../utils/logger"));
const ipn = async (req, res) => {
    const paymentData = req.body;
    try {
        const { val_id, tran_id, status } = paymentData;
        if (!val_id || !tran_id) {
            res.status(400).send("Invalid IPN data received");
            return;
        }
        // Initialize SSLCommerz instance for validation
        const sslcz = new sslcommerz_lts_1.default(paymentRoute_1.store_id || '', paymentRoute_1.store_passwd || '', paymentRoute_1.is_live);
        // Validate the transaction using val_id
        const validation = await sslcz.validate({ val_id });
        if (validation.status === 'VALID') {
            // Update donation status in database
            await moneyDonationSchema_1.default.updateOne({ tran_id: tran_id }, {
                status: status,
                bank_tran_id: paymentData.bank_tran_id,
                card_type: paymentData.card_type,
                tran_date: paymentData.tran_date,
            });
            logger_1.default.info(`IPN: Payment validated and updated for tran_id: ${tran_id}`);
            res.status(200).send("IPN processed successfully");
            return;
        }
        else {
            // Record failed validation in database
            await moneyDonationSchema_1.default.updateOne({ tran_id: tran_id }, { status: 'VALIDATION_FAILED' });
            logger_1.default.warn(`IPN: Payment validation failed for tran_id: ${tran_id}`);
            res.status(200).send("IPN validation failed");
            return;
        }
    }
    catch (error) {
        logger_1.default.error("IPN processing error:", error);
        // Always return 200 to SSLCommerz even if there's an error on our side
        res.status(200).send("IPN received with processing errors");
        return;
    }
};
exports.default = ipn;
