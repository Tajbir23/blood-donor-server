"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encryptPass_1 = __importDefault(require("../../handler/validation/encryptPass"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const generateJwt_1 = __importDefault(require("../../handler/validation/generateJwt"));
const addActiveUser_1 = __importDefault(require("../../handler/user/addActiveUser"));
const createUser = async (req, res) => {
    const data = JSON.parse(req.body.userData);
    const imageUrl = res.locals.imageUrl;
    data.profileImageUrl = imageUrl;
    data.role = "user";
    try {
        const encryptedPassword = await (0, encryptPass_1.default)(data.password);
        data.password = encryptedPassword;
        const user = await userSchema_1.default.create(data);
        (0, addActiveUser_1.default)(user._id);
        const token = (0, generateJwt_1.default)(user.phone, user._id, user.role);
        // Set cookie with minimal options
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "User creation failed", error });
    }
};
exports.default = createUser;
