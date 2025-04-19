"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJwt = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        console.log("verifyJwt.ts token", token);
        if (!token) {
            console.log("verifyJwt.ts", 401);
            res.status(401).json({ message: 'অনুমতি নেই' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        console.log("verifyJwt.ts error", 401);
        res.status(401).json({ message: 'অবৈধ টোকেন' });
    }
};
exports.default = verifyJwt;
