"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resRegUser = exports.saveUser = exports.tempStoreUser = void 0;
const encryptPass_1 = __importDefault(require("../../handler/validation/encryptPass"));
const userSchema_1 = __importDefault(require("../../models/user/userSchema"));
const generateJwt_1 = __importDefault(require("../../handler/validation/generateJwt"));
const addActiveUser_1 = __importDefault(require("../../handler/user/addActiveUser"));
const sendOtp_1 = __importDefault(require("./sendOtp"));
const findOrgRole_1 = __importDefault(require("../administrator/organizations/user/findOrgRole"));
exports.tempStoreUser = new Map();
const saveUser = async (data) => {
    const { latitude, longitude, ...restData } = data;
    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);
    const user = await userSchema_1.default.create({
        ...restData,
        location: {
            type: 'Point',
            coordinates: [long, lat]
        }
    });
    user.emailVerified = true;
    await user.save;
    await exports.tempStoreUser.delete(user?.email);
    (0, addActiveUser_1.default)(user._id);
    const orgRole = await (0, findOrgRole_1.default)(user._id.toString());
    const token = (0, generateJwt_1.default)(user.phone, user._id, user.role, orgRole);
    return { user, token };
};
exports.saveUser = saveUser;
const resRegUser = async (email, res) => {
    const userData = exports.tempStoreUser.get(email);
    if (userData) {
        const { user, token } = await (0, exports.saveUser)(userData);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });
        res.status(200).json({ success: true, message: "OTP verified", user, token });
    }
};
exports.resRegUser = resRegUser;
const createUser = async (req, res) => {
    const data = JSON.parse(req.body.userData);
    const imageUrl = res.locals.imageUrl;
    data.profileImageUrl = imageUrl;
    data.role = "user";
    try {
        const encryptedPassword = await (0, encryptPass_1.default)(data.password);
        data.password = encryptedPassword;
        await (0, sendOtp_1.default)(data?.email);
        const checkUniqueEmail = await userSchema_1.default.findOne({ email: data?.email });
        const checkUniquePhone = await userSchema_1.default.findOne({ phone: data?.phone });
        if (checkUniqueEmail) {
            res.status(400).json({ success: false, message: "Email already exists" });
            return;
        }
        if (checkUniquePhone) {
            res.status(400).json({ success: false, message: "Phone number already exists" });
            return;
        }
        exports.tempStoreUser.set(data?.email, data);
        res.status(200).json({ success: true, message: "OTP sent to email", email: data.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "User creation failed", error });
    }
};
exports.default = createUser;
