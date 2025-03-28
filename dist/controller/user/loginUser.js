"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const verifyPass_1 = __importDefault(require("../../handler/validation/verifyPass"));
const generateJwt_1 = __importDefault(require("../../handler/validation/generateJwt"));
const addActiveUser_1 = __importDefault(require("../../handler/user/addActiveUser"));
const loginUser = async (req, res) => {
    const { identity, password } = req.body;
    try {
        if (!identity || !password) {
            res.status(400).json({ message: "ফোন নম্বর বা পাসওয়ার্ড প্রদত্ত করুন" });
            return;
        }
        const user = await userSchema_1.default.findOne({
            $or: [
                { phone: identity },
                { email: identity }
            ]
        });
        console.log(user);
        if (user) {
            const checkPass = await (0, verifyPass_1.default)(password, user.password);
            if (checkPass) {
                (0, addActiveUser_1.default)(user._id);
                const token = (0, generateJwt_1.default)(user.phone, user._id, user.role);
                res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "lax" });
                res.status(200).json({ success: true, message: "Login successful", user });
                return;
            }
            else {
                res.status(401).json({ message: "পাসওয়ার্ড ভুল হয়েছে" });
                return;
            }
        }
        else {
            res.status(401).json({ message: "ফোন নম্বর বা পাসওয়ার্ড ভুল হয়েছে" });
            return;
        }
    }
    catch (error) {
        console.log(error?.message, error);
        res.status(500).json({ message: "সার্ভার ত্রুটি" });
    }
};
exports.default = loginUser;
