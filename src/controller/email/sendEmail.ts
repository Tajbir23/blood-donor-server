import nodemailer from 'nodemailer';

import generateEmailTemplate, { EmailType } from './generateEmailTemplate';
import { ResponseEmailMessage, ResponseEmailType } from '../../types/ResponseEmailType';

// Get default subject based on email type
const getDefaultSubject = (type: EmailType): string => {
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
const createTransporter = () =>
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,   // Must be a Google App Password (16-char)
        },
    });

let transporter = createTransporter();

/**
 * Verify SMTP credentials. Call this on server startup.
 * Returns { success, message }.
 */
export const verifyEmailConfig = async (): Promise<ResponseEmailMessage> => {
    try {
        transporter = createTransporter();   // refresh in case env changed
        await transporter.verify();
        console.log('[Email] SMTP connection verified — ready to send');
        return { success: true, message: 'SMTP সংযোগ সফল' };
    } catch (error: any) {
        const isAuthError =
            error?.responseCode === 535 ||
            (error?.code === 'EAUTH') ||
            String(error).includes('535') ||
            String(error).includes('Username and Password not accepted');

        const friendlyMsg = isAuthError
            ? '[Email] Gmail authentication failed. আপনার GMAIL_PASS একটি Google App Password হতে হবে (Gmail → Security → 2-Step → App passwords).'
            : `[Email] SMTP verification failed: ${error?.message ?? error}`;

        console.error(friendlyMsg);
        return { success: false, message: friendlyMsg };
    }
};

const sendEmail = async (data: ResponseEmailType): Promise<ResponseEmailMessage> => {
    const { email, subject, templateType, templateData } = data;

    const emailSubject = subject || getDefaultSubject(templateType as EmailType);

    const htmlContent = generateEmailTemplate(templateType as EmailType, templateData);

    const mailOptions = {
        from: `"ব্লাড ডোনার" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: emailSubject,
        html: htmlContent,
        text: (templateType === 'otp' || templateType === 'verifyEmail')
            ? templateData?.otp
            : templateType === 'forgot-password'
                ? `আপনার নতুন পাসওয়ার্ড: ${templateData?.newPassword}`
                : templateData?.message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Sent to ${email} — messageId: ${info.messageId}`);
        return { success: true, message: 'ইমেইল সফলভাবে পাঠানো হয়েছে' };
    } catch (error: any) {
        const isAuthError =
            error?.responseCode === 535 ||
            error?.code === 'EAUTH' ||
            String(error).includes('535');

        const friendlyMsg = isAuthError
            ? 'Gmail authentication failed — সঠিক App Password ব্যবহার করুন'
            : `ইমেইল পাঠাতে ব্যর্থ হয়েছে: ${error?.message ?? error}`;

        console.error(`[Email] Failed to send to ${email}:`, error?.message ?? error);
        return { success: false, message: friendlyMsg };
    }
};

export default sendEmail;
