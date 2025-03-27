import { Router } from "express";
import { loginLimiter } from "../config/limiter";
import createUser from "../controller/user/createUser";
import imageUpload from "../handler/fileUpload/imageUpload";
import loginUser from "../controller/user/loginUser";
import verifyJwt from "../handler/validation/verifyJwt";
import logoutUser from "../controller/user/logoutUser";

const userRouter = Router();

userRouter.post('/register', loginLimiter, imageUpload, createUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.get("/logout", verifyJwt, logoutUser)

export default userRouter;