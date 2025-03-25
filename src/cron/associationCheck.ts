import cron from 'node-cron';
import { createLogger } from '../utils/logger';

// Import the correct models
import associationModel from '../models/association/associationSchema';
import userModel from '../models/user/userSchema';

const logger = createLogger('association-check-cron');

// Function to check associations and ban those with insufficient members
const checkAssociations = async (): Promise<void> => {
  console.log("checkAssociations")
  try {
    logger.info('Starting association member check');
    
    // Get date 3 days ago for comparison
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Find associations created more than 3 days ago
    const associations = await associationModel.find({
      createdAt: { $lt: threeDaysAgo },
      isBanned: false // Only check non-banned associations
    });
    
    logger.info(`Found ${associations.length} associations older than 3 days to check`);
    
    let bannedCount = 0;
    
    for (const association of associations) {
      // Count users that have this associationId
      const memberCount = await userModel.countDocuments({
        associationId: association._id
      });
      
      // If less than 4 members, ban the association
      if (memberCount < 4) {
        logger.info(`Association ${association._id} (${association.organizationName}) has only ${memberCount} members after 3 days. Banning.`);
        
        // Update the association to mark it as banned
        await associationModel.findByIdAndUpdate(
          association._id,
          {
            isBanned: true,
            banReason: 'Insufficient members within 3 days of creation',
            bannedAt: new Date()
          }
        );
        
        bannedCount++;
      }
    }
    
    logger.info(`Association check completed. Banned ${bannedCount} associations.`);
  } catch (error) {
    logger.error('Error in association check cron job:', error);
  }
};

// Schedule cron job to run every day at midnight (12 AM)
const scheduleAssociationCheck = (): void => {
  logger.info('Scheduling association check cron job for midnight');
  
  // '0 0 * * *' = Run at 00:00 (midnight) every day
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled association check');
    await checkAssociations();
  });
};

export default scheduleAssociationCheck; 