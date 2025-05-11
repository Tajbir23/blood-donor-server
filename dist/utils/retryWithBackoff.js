"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility function to retry operations with exponential backoff
 * Useful for handling rate limit errors from external APIs
 */
const retryWithBackoff = async (operation, options = {
    maxRetries: 5,
    initialDelay: 1000, // 1 second
    maxDelay: 60000, // 1 minute
    factor: 2, // exponential factor
    jitter: 0.1, // add some randomness to the delay
}) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let retries = 0;
    while (true) {
        try {
            return await operation();
        }
        catch (error) {
            retries++;
            // If we've reached max retries or it's not a rate limit error, throw
            if (retries >= options.maxRetries) {
                throw error;
            }
            // Check if this is a Facebook API error we should retry
            const isRetryable = ((_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.code) === 613 || // Rate limit error 
                ((_f = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.code) === 2 || // Temporary error
                ((_g = error.response) === null || _g === void 0 ? void 0 : _g.status) === 500 || // Internal Server Error
                ((_h = error.response) === null || _h === void 0 ? void 0 : _h.status) === 502 || // Bad Gateway
                error.code === 'ECONNRESET' || // Connection reset
                error.code === 'ETIMEDOUT'; // Timeout
            if (!isRetryable) {
                throw error;
            }
            // Calculate delay with exponential backoff and jitter
            const delay = Math.min(options.initialDelay * Math.pow(options.factor, retries) *
                (1 + Math.random() * options.jitter), options.maxDelay);
            console.log(`API error (${((_l = (_k = (_j = error.response) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.error) === null || _l === void 0 ? void 0 : _l.code) || error.code || error.message}). Retrying in ${Math.round(delay / 1000)} seconds...`);
            // Wait for the calculated delay
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
exports.default = retryWithBackoff;
