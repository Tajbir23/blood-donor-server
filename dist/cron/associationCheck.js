"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
// Import the correct models
const associationSchema_1 = __importDefault(require("../models/association/associationSchema"));
const userSchema_1 = __importDefault(require("../models/user/userSchema"));
const logger = (0, logger_1.createLogger)('association-check-cron');
// Function to check associations and ban those with insufficient members
const checkAssociations = async () => {
    console.log("checkAssociations");
    try {
        logger.info('Starting association member check');
        // Get date 3 days ago for comparison
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        // Find associations created more than 3 days ago
        const associations = await associationSchema_1.default.find({
            createdAt: { $lt: threeDaysAgo },
            isBanned: false // Only check non-banned associations
        });
        logger.info(`Found ${associations.length} associations older than 3 days to check`);
        let bannedCount = 0;
        for (const association of associations) {
            // Count users that have this associationId
            const memberCount = await userSchema_1.default.countDocuments({
                associationId: association._id
            });
            // If less than 4 members, ban the association
            if (memberCount < 4) {
                logger.info(`Association ${association._id} (${association.organizationName}) has only ${memberCount} members after 3 days. Banning.`);
                // Update the association to mark it as banned
                await associationSchema_1.default.findByIdAndUpdate(association._id, {
                    isBanned: true,
                    banReason: 'Insufficient members within 3 days of creation',
                    bannedAt: new Date()
                });
                bannedCount++;
            }
        }
        logger.info(`Association check completed. Banned ${bannedCount} associations.`);
    }
    catch (error) {
        logger.error('Error in association check cron job:', error);
    }
};
// Schedule cron job to run every day at midnight (12 AM)
const scheduleAssociationCheck = () => {
    logger.info('Scheduling association check cron job for midnight');
    // '0 0 * * *' = Run at 00:00 (midnight) every day
    node_cron_1.default.schedule('0 0 * * *', async () => {
        logger.info('Running scheduled association check');
        await checkAssociations();
    });
};
exports.default = scheduleAssociationCheck;
