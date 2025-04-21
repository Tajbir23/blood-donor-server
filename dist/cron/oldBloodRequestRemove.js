"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const bloodRequestSchema_1 = __importDefault(require("../models/blood/bloodRequestSchema"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('old-blood-request-remove-cron');
const oldBloodRequestRemove = async () => {
    logger.info('Removing old blood requests');
    await bloodRequestSchema_1.default.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) }
    });
};
const scheduleOldBloodRequestRemove = () => {
    logger.info('Scheduling old blood request remove cron job for every 3 days at 00:00');
    node_cron_1.default.schedule('0 0 * * *', async () => {
        await oldBloodRequestRemove();
    });
};
exports.default = scheduleOldBloodRequestRemove;
