/**
 * Simple logger utility for structured logging
 */
interface Logger {
  info: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

/**
 * Creates a logger with the specified context
 * @param context The context name to be included in log messages
 * @returns Logger object with methods for different log levels
 */
export const createLogger = (context: string): Logger => {
  return {
    info: (message: string, ...meta: any[]) => {
      console.log(`[${new Date().toISOString()}] [INFO] [${context}] ${message}`, ...meta);
    },
    error: (message: string, ...meta: any[]) => {
      console.error(`[${new Date().toISOString()}] [ERROR] [${context}] ${message}`, ...meta);
    },
    warn: (message: string, ...meta: any[]) => {
      console.warn(`[${new Date().toISOString()}] [WARN] [${context}] ${message}`, ...meta);
    },
    debug: (message: string, ...meta: any[]) => {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${context}] ${message}`, ...meta);
    }
  };
};

// Default logger instance
const logger = createLogger('App');
export default logger;
