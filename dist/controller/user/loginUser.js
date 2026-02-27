"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const verifyPass_1 = __importDefault(require("../../handler/validation/verifyPass"));
const generateJwt_1 = __importDefault(require("../../handler/validation/generateJwt"));
const addActiveUser_1 = __importDefault(require("../../handler/user/addActiveUser"));
const findOrgRole_1 = __importDefault(require("../administrator/organizations/user/findOrgRole"));
const loginUser = async (req, res) => {
    const { identity, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
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
        if (user) {
            const checkPass = await (0, verifyPass_1.default)(password, user.password);
            if (checkPass) {
                await (0, addActiveUser_1.default)(user._id);
                const userId = user._id.toString();
                const orgRole = await (0, findOrgRole_1.default)(userId);
                const token = (0, generateJwt_1.default)(user.phone, user._id, user.role, orgRole);
                user.token = token;
                user.lastLoginIp = ip;
                await user.save();
                res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax" });
                res.status(200).json({ success: true, message: "Login successful", user });
                return;
            }
            else {
                res.status(403).json({ message: "পাসওয়ার্ড ভুল হয়েছে" });
                return;
            }
        }
        else {
            console.log("fingOrgRole.ts", 401);
            res.status(401).json({ message: "ফোন নম্বর বা পাসওয়ার্ড ভুল হয়েছে" });
            return;
        }
    }
    catch (error) {
        console.log(error === null || error === void 0 ? void 0 : error.message, error);
        res.status(500).json({ message: "সার্ভার ত্রুটি" });
    }
};
exports.default = loginUser;
