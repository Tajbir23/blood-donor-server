"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const generateEmailTemplate_1 = __importDefault(require("./generateEmailTemplate"));
// Remove the duplicate type definition
// type EmailType = 'otp' | 'support' | 'bloodRequest';
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
// Function to generate dynamic HTML content based on template type
const sendEmail = async (data) => {
    const { email, subject, templateType, templateData } = data;
    // Use provided subject or get default based on template type
    const emailSubject = subject || getDefaultSubject(templateType);
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address
            pass: process.env.GMAIL_PASS // Your Gmail password or App Password
        }
    });
    // Generate HTML content based on template type
    const htmlContent = (0, generateEmailTemplate_1.default)(templateType, templateData);
    // Set up email data
    const mailOptions = {
        from: `"ব্লাড ডোনার" <${process.env.GMAIL_USER}>`, // Sender address with name
        to: email, // List of receivers
        subject: emailSubject, // Dynamic subject based on template type
        html: htmlContent, // HTML body
        text: (templateType === "otp" || templateType === "verifyEmail") ? templateData === null || templateData === void 0 ? void 0 : templateData.otp :
            (templateType === "forgot-password") ? `আপনার নতুন পাসওয়ার্ড: ${templateData === null || templateData === void 0 ? void 0 : templateData.newPassword}` :
                templateData === null || templateData === void 0 ? void 0 : templateData.message
    };
    try {
        // Send mail with defined transport object
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'ইমেইল সফলভাবে পাঠানো হয়েছে' };
    }
    catch (error) {
        return { success: false, message: `ইমেইল পাঠাতে ব্যর্থ হয়েছে: ${error}` };
    }
};
exports.default = sendEmail;
