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
    await exports.tempStoreUser.delete(user === null || user === void 0 ? void 0 : user.email);
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
    var _a, _b, _c, _d, _e, _f;
    const data = JSON.parse(req.body.userData);
    const imageUrl = res.locals.imageUrl;
    data.profileImageUrl = imageUrl;
    data.role = "user";
    try {
        const encryptedPassword = await (0, encryptPass_1.default)(data.password);
        data.password = encryptedPassword;
        // Extract client IP
        const clientIp = ((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) || ((_c = req.socket) === null || _c === void 0 ? void 0 : _c.remoteAddress) || req.ip || null;
        data.ipAddress = clientIp;
        const checkUniqueEmail = await userSchema_1.default.findOne({ email: data === null || data === void 0 ? void 0 : data.email });
        const checkUniquePhone = await userSchema_1.default.findOne({ phone: data === null || data === void 0 ? void 0 : data.phone });
        if (checkUniqueEmail) {
            res.status(400).json({ success: false, message: "এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে" });
            return;
        }
        if (checkUniquePhone) {
            res.status(400).json({ success: false, message: "এই ফোন নম্বর ইতিমধ্যে ব্যবহৃত হচ্ছে" });
            return;
        }
        // Block duplicate device: same fingerprint visitorId
        if ((_d = data === null || data === void 0 ? void 0 : data.fingerprint) === null || _d === void 0 ? void 0 : _d.visitorId) {
            const checkFingerprint = await userSchema_1.default.findOne({ 'fingerPrint.visitorId': data.fingerprint.visitorId });
            if (checkFingerprint) {
                res.status(400).json({ success: false, message: "এই ডিভাইস থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" });
                return;
            }
        }
        // Block duplicate device: same canvas fingerprint (strong hardware signal)
        if ((_e = data === null || data === void 0 ? void 0 : data.fingerprint) === null || _e === void 0 ? void 0 : _e.canvas) {
            const checkCanvas = await userSchema_1.default.findOne({ 'fingerPrint.canvas': data.fingerprint.canvas });
            if (checkCanvas) {
                res.status(400).json({ success: false, message: "এই ডিভাইস থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" });
                return;
            }
        }
        // Block duplicate IP
        if (clientIp) {
            const checkIp = await userSchema_1.default.findOne({ ipAddress: clientIp });
            if (checkIp) {
                res.status(400).json({ success: false, message: "এই নেটওয়ার্ক থেকে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে" });
                return;
            }
        }
        const emailResult = await (0, sendOtp_1.default)(data === null || data === void 0 ? void 0 : data.email);
        if (!(emailResult === null || emailResult === void 0 ? void 0 : emailResult.success)) {
            res.status(500).json({ success: false, message: (_f = emailResult === null || emailResult === void 0 ? void 0 : emailResult.message) !== null && _f !== void 0 ? _f : 'OTP ইমেইল পাঠাতে ব্যর্থ হয়েছে। আপনার ইমেইল ঠিকানা যাচাই করুন।' });
            return;
        }
        exports.tempStoreUser.set(data === null || data === void 0 ? void 0 : data.email, data);
        res.status(200).json({ success: true, message: "OTP আপনার ইমেইলে পাঠানো হয়েছে", email: data.email });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "User creation failed", error });
    }
};
exports.default = createUser;
