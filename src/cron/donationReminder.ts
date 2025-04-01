import cron from 'node-cron';
import { createLogger } from '../utils/logger';
import userModel from '../models/user/userSchema';
import sendEmail from '../controller/email/sendEmail';

const logger = createLogger('donation-reminder-cron');

// Function to check users and send reminders
const checkDonationDates = async (): Promise<void> => {
  try {
    logger.info('Starting donation reminder check');
    
    // Current date for comparison
    const currentDate = new Date();
    
    // Two separate queries for different user groups:
    
    // 1. Users who have donated before but not in the last 4 months
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(currentDate.getMonth() - 4);
    const fourMonthsAgoStr = fourMonthsAgo.toISOString().split('T')[0];
    
    const regularsQuery = {
      isActive: true,
      lastDonationDate: { $ne: null, $lt: fourMonthsAgoStr }
    };
    
    // 2. Users with no donation date recorded
    // For these users, we only want to send reminders every 10 days
    // We'll check if they've received a reminder in the last 10 days
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(currentDate.getDate() - 10);
    
    const newUsersQuery = {
      isActive: true,
      lastDonationDate: null,
      // To simulate the 10-day interval, we'll only include users who:
      // a) Never got a reminder email OR
      // b) Got their last reminder more than 10 days ago
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: tenDaysAgo } }
      ]
    };
    
    // Combine both queries with $or
    const users = await userModel.find({
      $or: [regularsQuery, newUsersQuery]
    });
    
    logger.info(`Found ${users.length} users eligible for donation reminders`);
    
    let emailsSent = 0;
    let newDonorReminders = 0;
    let regularDonorReminders = 0;
    
    // Send emails to eligible users
    for (const user of users) {
      // Skip if user has no email
      if (!user.email) continue;
      
      // Determine if this is a new donor (no donation history) or regular donor
      const isNewDonor = user.lastDonationDate === null;
      
      try {
        // Send reminder email with appropriate message for user type
        const result = await sendEmail({
          email: user.email,
          subject: isNewDonor 
            ? 'আপনার প্রথম রক্তদান - জীবন বাঁচাতে এগিয়ে আসুন'
            : 'আপনার রক্তদানের সময় হয়েছে - জীবন বাঁচাতে সহায়তা করুন',
          templateType: 'remindDonation',
          templateData: {
            name: user.fullName,
            isNewDonor: isNewDonor ? 'true' : 'false',
            donationLink: `${process.env.FRONTEND_URL}/blood-donation`,
            updateLink: `${process.env.FRONTEND_URL}/profile`
          }
        });
        
        if (result.success) {
          emailsSent++;
          if (isNewDonor) {
            newDonorReminders++;
          } else {
            regularDonorReminders++;
          }
          
          // Update the lastReminderSent date for this user
          await userModel.findByIdAndUpdate(user._id, {
            lastReminderSent: new Date()
          });
          
          logger.info(`Sent donation reminder to ${user.email} (${isNewDonor ? 'new donor' : 'regular donor'})`);
        } else {
          logger.error(`Failed to send donation reminder to ${user.email}: ${result.message}`);
        }
      } catch (emailError) {
        logger.error(`Error sending donation reminder to ${user.email}:`, emailError);
      }
    }
    
    logger.info(`Donation reminder check completed. Sent ${emailsSent} reminders (${newDonorReminders} new donors, ${regularDonorReminders} regular donors).`);
  } catch (error) {
    logger.error('Error in donation reminder cron job:', error);
  }
};

// Schedule cron job to run every day at 9 AM
const scheduleDonationReminder = (): void => {
  logger.info('Scheduling donation reminder cron job for 9 AM daily');
  
  // '0 9 * * *' = Run at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running scheduled donation reminder check');
    await checkDonationDates();
  });
  
  // Run immediately for testing purposes (comment out in production)
  // checkDonationDates();
};

export default scheduleDonationReminder; 