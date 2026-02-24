"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
/**
 * Creates a logger with the specified context
 * @param context The context name to be included in log messages
 * @returns Logger object with methods for different log levels
 */
const createLogger = (context) => {
    return {
        info: (message, ...meta) => {
            console.log(`[${new Date().toISOString()}] [INFO] [${context}] ${message}`, ...meta);
        },
        error: (message, ...meta) => {
            console.error(`[${new Date().toISOString()}] [ERROR] [${context}] ${message}`, ...meta);
        },
        warn: (message, ...meta) => {
            console.warn(`[${new Date().toISOString()}] [WARN] [${context}] ${message}`, ...meta);
        },
        debug: (message, ...meta) => {
            console.debug(`[${new Date().toISOString()}] [DEBUG] [${context}] ${message}`, ...meta);
        }
    };
};
exports.createLogger = createLogger;
// Default logger instance
const logger = (0, exports.createLogger)('App');
exports.default = logger;
