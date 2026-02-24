"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailConfig = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateEmailTemplate_1 = __importDefault(require("./generateEmailTemplate"));
// Get default subject based on email type
const getDefaultSubject = (type) => {
    switch (type) {
        case 'otp':
            return 'আপনার যাচাইকরণ কোড';
        case 'support':
            return 'ব্লাড ডোনার সাপোর্ট থেকে প্রতিক্রিয়া';
        case 'bloodRequest':
            return 'জরুরী: রক্তদানের অনুরোধ';
        case 'verifyEmail':
            return 'ইমেইল যাচাইকরণ';
        case 'forgot-password':
            return 'আপনার পাসওয়ার্ড রিসেট করা হয়েছে';
        case 'remindDonation':
            return 'আপনার রক্তদানের সময় হয়েছে - জীবন বাঁচাতে সহায়তা করুন';
        case 'nextDonationReminder':
            return 'আপনার পরবর্তী রক্তদান - সুরক্ষিত থাকুন এবং সতর্ক হোন';
        default:
            return 'ব্লাড ডোনার থেকে বার্তা';
    }
};
// Singleton transporter — created once, reused for all emails
const createTransporter = () => nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Must be a Google App Password (16-char)
    },
});
let transporter = createTransporter();
/**
 * Verify SMTP credentials. Call this on server startup.
 * Returns { success, message }.
 */
const verifyEmailConfig = async () => {
    var _a;
    try {
        transporter = createTransporter(); // refresh in case env changed
        await transporter.verify();
        console.log('[Email] SMTP connection verified — ready to send');
        return { success: true, message: 'SMTP সংযোগ সফল' };
    }
    catch (error) {
        const isAuthError = (error === null || error === void 0 ? void 0 : error.responseCode) === 535 ||
            ((error === null || error === void 0 ? void 0 : error.code) === 'EAUTH') ||
            String(error).includes('535') ||
            String(error).includes('Username and Password not accepted');
        const friendlyMsg = isAuthError
            ? '[Email] Gmail authentication failed. আপনার GMAIL_PASS একটি Google App Password হতে হবে (Gmail → Security → 2-Step → App passwords).'
            : `[Email] SMTP verification failed: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error}`;
        console.error(friendlyMsg);
        return { success: false, message: friendlyMsg };
    }
};
exports.verifyEmailConfig = verifyEmailConfig;
const sendEmail = async (data) => {
    var _a, _b;
    const { email, subject, templateType, templateData } = data;
    const emailSubject = subject || getDefaultSubject(templateType);
    const htmlContent = (0, generateEmailTemplate_1.default)(templateType, templateData);
    const mailOptions = {
        from: `"ব্লাড ডোনার" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: emailSubject,
        html: htmlContent,
        text: (templateType === 'otp' || templateType === 'verifyEmail')
            ? templateData === null || templateData === void 0 ? void 0 : templateData.otp
            : templateType === 'forgot-password'
                ? `আপনার নতুন পাসওয়ার্ড: ${templateData === null || templateData === void 0 ? void 0 : templateData.newPassword}`
                : templateData === null || templateData === void 0 ? void 0 : templateData.message,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent to ${email} — messageId: ${info.messageId}`);
        return { success: true, message: 'ইমেইল সফলভাবে পাঠানো হয়েছে' };
    }
    catch (error) {
        const isAuthError = (error === null || error === void 0 ? void 0 : error.responseCode) === 535 ||
            (error === null || error === void 0 ? void 0 : error.code) === 'EAUTH' ||
            String(error).includes('535');
        const friendlyMsg = isAuthError
            ? 'Gmail authentication failed — সঠিক App Password ব্যবহার করুন'
            : `ইমেইল পাঠাতে ব্যর্থ হয়েছে: ${(_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error}`;
        console.error(`[Email] Failed to send to ${email}:`, (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error);
        return { success: false, message: friendlyMsg };
    }
};
exports.default = sendEmail;
