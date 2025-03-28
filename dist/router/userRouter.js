"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const limiter_1 = require("../config/limiter");
const createUser_1 = __importDefault(require("../controller/user/createUser"));
const imageUpload_1 = __importDefault(require("../handler/fileUpload/imageUpload"));
const loginUser_1 = __importDefault(require("../controller/user/loginUser"));
const verifyJwt_1 = __importDefault(require("../handler/validation/verifyJwt"));
const logoutUser_1 = __importDefault(require("../controller/user/logoutUser"));
const userRouter = (0, express_1.Router)();
userRouter.post('/register', limiter_1.loginLimiter, imageUpload_1.default, createUser_1.default);
userRouter.post('/login', limiter_1.loginLimiter, loginUser_1.default);
userRouter.get("/logout", verifyJwt_1.default, logoutUser_1.default);
exports.default = userRouter;
