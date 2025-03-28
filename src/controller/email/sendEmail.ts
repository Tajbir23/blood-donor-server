import nodemailer from 'nodemailer';

import generateEmailTemplate, { EmailType } from './generateEmailTemplate';
import { ResponseEmailMessage, ResponseEmailType } from '../../types/ResponseEmailType';


// Remove the duplicate type definition
// type EmailType = 'otp' | 'support' | 'bloodRequest';

// Get default subject based on email type
const getDefaultSubject = (type: EmailType): string => {
    switch (type) {
        case 'otp':
            return 'আপনার যাচাইকরণ কোড';
        case 'support':
            return 'ব্লাড ডোনার সাপোর্ট থেকে প্রতিক্রিয়া';
        case 'bloodRequest':
            return 'জরুরী: রক্তদানের অনুরোধ';
        default:
            return 'ব্লাড ডোনার থেকে বার্তা';
    }
};

// Function to generate dynamic HTML content based on template type


const sendEmail = async (data : ResponseEmailType): Promise<ResponseEmailMessage> => {
    const { email, subject, templateType, templateData } = data;
    console.log(data)

    // Use provided subject or get default based on template type
    const emailSubject = subject || getDefaultSubject(templateType as EmailType);

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address
            pass: process.env.GMAIL_PASS  // Your Gmail password or App Password
        }
    });

    // Generate HTML content based on template type
    const htmlContent = generateEmailTemplate(templateType as EmailType, templateData);

    // Set up email data
    const mailOptions = {
        from: `"ব্লাড ডোনার" <${process.env.GMAIL_USER}>`, // Sender address with name
        to: email,                    // List of receivers
        subject: emailSubject,        // Dynamic subject based on template type
        html: htmlContent,            // HTML body
        text: (templateType === "otp" || templateType === "verifyEmail") ? templateData?.otp : 
              (templateType === "forgot-password") ? `আপনার নতুন পাসওয়ার্ড: ${templateData?.newPassword}` : 
              templateData?.message
    };

    try {
        // Send mail with defined transport object
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'ইমেইল সফলভাবে পাঠানো হয়েছে' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: `ইমেইল পাঠাতে ব্যর্থ হয়েছে: ${error}` };
    }
};

export default sendEmail;
    