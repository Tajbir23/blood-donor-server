"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
const userSchema_1 = __importDefault(require("../models/user/userSchema"));
const sendEmail_1 = __importDefault(require("../controller/email/sendEmail"));
const logger = (0, logger_1.createLogger)('donation-reminder-cron');
// Function to check users and send reminders
const checkDonationDates = async () => {
    try {
        logger.info('Starting donation reminder check');
        // Current date for comparison
        const currentDate = new Date();
        // 1. Users who have donated before but not in the last 4 months
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
        const fourMonthsAgoStr = fourMonthsAgo.toISOString().split('T')[0];
        // Find users who either:
        // 1. Have donated before but not in the last 4 months
        // 2. Have never donated (lastDonationDate is null)
        const users = await userSchema_1.default.find({
            isActive: true,
            $or: [
                { lastDonationDate: null },
                { lastDonationDate: { $ne: null, $lt: fourMonthsAgoStr } }
            ]
        });
        logger.info(`Found ${users.length} users eligible for donation reminders`);
        let emailsSent = 0;
        let newDonorReminders = 0;
        let regularDonorReminders = 0;
        // Send emails to eligible users
        for (const user of users) {
            // Skip if user has no email
            if (!user.email)
                continue;
            // Determine if this is a new donor (no donation history) or regular donor
            const isNewDonor = user.lastDonationDate === null;
            try {
                // Send reminder email with appropriate message for user type
                const result = await (0, sendEmail_1.default)({
                    email: user.email,
                    subject: isNewDonor
                        ? 'আপনার প্রথম রক্তদান - জীবন বাঁচাতে এগিয়ে আসুন'
                        : 'আপনার রক্তদানের সময় হয়েছে - জীবন বাঁচাতে সহায়তা করুন',
                    templateType: 'remindDonation',
                    templateData: {
                        name: user.fullName,
                        isNewDonor: isNewDonor ? 'true' : 'false',
                        donationLink: `${process.env.FRONTEND_URL}/blood-donation`,
                        updateLink: `${process.env.FRONTEND_URL}/update_last_donation`
                    }
                });
                if (result.success) {
                    emailsSent++;
                    if (isNewDonor) {
                        newDonorReminders++;
                    }
                    else {
                        regularDonorReminders++;
                    }
                    logger.info(`Sent donation reminder to ${user.email} (${isNewDonor ? 'new donor' : 'regular donor'})`);
                }
                else {
                    logger.error(`Failed to send donation reminder to ${user.email}: ${result.message}`);
                }
            }
            catch (emailError) {
                logger.error(`Error sending donation reminder to ${user.email}:`, emailError);
            }
        }
        logger.info(`Donation reminder check completed. Sent ${emailsSent} reminders (${newDonorReminders} new donors, ${regularDonorReminders} regular donors).`);
    }
    catch (error) {
        logger.error('Error in donation reminder cron job:', error);
    }
};
// Schedule cron job to run every 10 days at 9 AM
const scheduleDonationReminder = () => {
    logger.info('Scheduling donation reminder cron job for every 10 days at 9 AM');
    // '0 9 */10 * *' = Run at 9:00 AM every 10 days
    node_cron_1.default.schedule('0 9 */10 * *', async () => {
        logger.info('Running scheduled donation reminder check');
        await checkDonationDates();
    });
    // Run immediately for testing purposes (comment out in production)
    // checkDonationDates();
};
exports.default = scheduleDonationReminder;
