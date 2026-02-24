"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moneyDonationSchema_1 = __importDefault(require("../../models/donation/moneyDonationSchema"));
const logger_1 = __importDefault(require("../../utils/logger"));
const failPayment = async (req, res) => {
    try {
        const { tran_id, error, status } = req.body;
        // Update donation status in database to "failed"
        if (tran_id) {
            await moneyDonationSchema_1.default.updateOne({ tran_id: tran_id }, { status: status || 'FAILED' });
            logger_1.default.info(`Payment failed for tran_id: ${tran_id}, reason: ${error || 'unknown'}`);
        }
        const errorReason = error || "payment_failed";
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?tran_id=${tran_id}&reason=${errorReason}`);
    }
    catch (err) {
        logger_1.default.error("Error processing failed payment:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/donation/failed?reason=server_error`);
    }
};
exports.default = failPayment;
