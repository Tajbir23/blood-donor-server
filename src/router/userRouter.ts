import { Router } from "express";
import { loginLimiter } from "../config/limiter";
import createUser from "../controller/user/createUser";
import { createImageUpload } from "../handler/fileUpload/imageUpload";
import loginUser from "../controller/user/loginUser";
import verifyJwt from "../handler/validation/verifyJwt";
import logoutUser from "../controller/user/logoutUser";
import verifyOtp from "../controller/user/verifyOtp";
import resendOtp from "../controller/user/resendOtp";
import forgotPassword from "../controller/user/forgotPassword";
import me from "../controller/user/me";
import updateLastDonation from "../controller/user/updateLastDonation";


const userRouter = Router();

const profileImageUpload = createImageUpload('profileImage')
userRouter.post('/register', profileImageUpload, createUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.get("/logout", verifyJwt, logoutUser)
userRouter.post("/verify-otp", loginLimiter, verifyOtp)
userRouter.post('/resend-otp', loginLimiter, resendOtp)
userRouter.post('/forgot-password', forgotPassword)
userRouter.get('/me', verifyJwt, me)
userRouter.post('/update-last-donation', verifyJwt, updateLastDonation)
export default userRouter;