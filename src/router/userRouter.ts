import { Router } from "express";
import { loginLimiter } from "../config/limiter";
import createUser from "../controller/user/createUser";
import loginUser from "../controller/user/loginUser";
import imageUpload from "../handler/fileUpload/imageUpload";

const userRouter = Router();

userRouter.post('/register', loginLimiter, imageUpload, createUser)
userRouter.post('/login-user', loginLimiter, loginUser)

export default userRouter;