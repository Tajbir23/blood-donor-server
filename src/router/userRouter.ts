import { Router } from "express";
import { loginLimiter } from "../config/limiter";
import createUser from "../controller/user/createUser";
import { profileImageUpload } from "../handler/fileUpload/imageUpload";
import loginUser from "../controller/user/loginUser";
import verifyJwt from "../handler/validation/verifyJwt";
import logoutUser from "../controller/user/logoutUser";
import verifyOtp from "../controller/user/verifyOtp";
import resendOtp from "../controller/user/resendOtp";
import forgotPassword from "../controller/user/forgotPassword";
import me from "../controller/user/me";
import updateLastDonation from "../controller/user/updateLastDonation";
import searchBlood from "../controller/blood/searchBlood";
import searchDonar from "../controller/user/searchDonar";
import updateProfileImage from "../controller/user/updateProfileImage";


const userRouter = Router();

// Using the optimized profileImageUpload middleware with preset dimensions and quality
userRouter.post('/register', profileImageUpload, createUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.get("/logout", verifyJwt, logoutUser)
userRouter.post("/verify-otp", loginLimiter, verifyOtp)
userRouter.post('/resend-otp', loginLimiter, resendOtp)
userRouter.post('/forgot-password', forgotPassword)
userRouter.get('/me', verifyJwt, me)
userRouter.post('/update-last-donation', verifyJwt, updateLastDonation)
userRouter.post("/donor/search", searchBlood)
userRouter.get("/search-users", searchDonar)
userRouter.put('/update-profile-image', verifyJwt, profileImageUpload, updateProfileImage)
export default userRouter;