import cron from 'node-cron'
import bloodRequestModel from "../models/blood/bloodRequestSchema"
import { createLogger } from '../utils/logger';

const logger = createLogger('old-blood-request-remove-cron');

const oldBloodRequestRemove = async () => {
    logger.info('Removing old blood requests');
    await bloodRequestModel.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) }
    })
}

const scheduleOldBloodRequestRemove = () => {
    logger.info('Scheduling old blood request remove cron job for every 3 days at 00:00');
    
    cron.schedule('0 0 * * *', async () => {
        await oldBloodRequestRemove()
    })
}

export default scheduleOldBloodRequestRemove
