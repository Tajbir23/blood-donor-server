import { Router } from "express";
import { loginLimiter } from "../config/limiter";
import createUser from "../controller/user/createUser";
import imageUpload from "../handler/fileUpload/imageUpload";
import loginUser from "../controller/user/loginUser";
import verifyJwt from "../handler/validation/verifyJwt";
import logoutUser from "../controller/user/logoutUser";
import verifyOtp from "../controller/user/verifyOtp";
import resendOtp from "../controller/user/resendOtp";


const userRouter = Router();

userRouter.post('/register', loginLimiter, imageUpload, createUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.get("/logout", verifyJwt, logoutUser)
userRouter.post("/verify-otp", verifyOtp)
userRouter.post('/resend-otp', resendOtp)
export default userRouter;