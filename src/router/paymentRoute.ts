import { Router } from "express";
import donation from "../controller/sslCommerze/donation";
import ipn from "../controller/sslCommerze/ipn";
import successPayment from "../controller/sslCommerze/successPayment";
import failPayment from "../controller/sslCommerze/failPayment";

const paymentRouter = Router();


export const store_id = process.env.SSLCOMMERZ_STORE_ID;
export const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
export const is_live = process.env.IS_LIVE === "true";

paymentRouter.post('/donation', donation)
paymentRouter.post('/ipn', ipn)
paymentRouter.post('/success', successPayment)
paymentRouter.post('/fail', failPayment)
export default paymentRouter;

