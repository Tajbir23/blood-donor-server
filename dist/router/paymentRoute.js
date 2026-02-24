"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_live = exports.store_passwd = exports.store_id = void 0;
const express_1 = require("express");
const donation_1 = __importDefault(require("../controller/sslCommerze/donation"));
const ipn_1 = __importDefault(require("../controller/sslCommerze/ipn"));
const successPayment_1 = __importDefault(require("../controller/sslCommerze/successPayment"));
const failPayment_1 = __importDefault(require("../controller/sslCommerze/failPayment"));
const getInvoice_1 = __importDefault(require("../controller/sslCommerze/getInvoice"));
const securityUtils_1 = require("../utils/securityUtils");
const paymentRouter = (0, express_1.Router)();
exports.store_id = process.env.SSLCOMMERZ_STORE_ID;
exports.store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
exports.is_live = process.env.IS_LIVE === "true";
paymentRouter.post('/donation', donation_1.default);
paymentRouter.post('/ipn', ipn_1.default);
paymentRouter.post('/success', successPayment_1.default);
paymentRouter.post('/fail', failPayment_1.default);
paymentRouter.get('/invoice/:tran_id', (0, securityUtils_1.applyCSP)({
    allowFonts: true,
    allowImages: true,
    allowInlineStyles: true
}), getInvoice_1.default);
exports.default = paymentRouter;
