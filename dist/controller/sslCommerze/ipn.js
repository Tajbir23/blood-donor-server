"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ipn = async (req, res) => {
    const paymentData = req.body;
    console.log(paymentData);
    res.send("IPN received");
};
exports.default = ipn;
