/**
 * Utility function to retry operations with exponential backoff
 * Useful for handling rate limit errors from external APIs
 */
const retryWithBackoff = async (
  operation: () => any,
  options = {
    maxRetries: 5,
    initialDelay: 1000, // 1 second
    maxDelay: 60000, // 1 minute
    factor: 2, // exponential factor
    jitter: 0.1, // add some randomness to the delay
  }
): Promise<any> => {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      
      // If we've reached max retries or it's not a rate limit error, throw
      if (retries >= options.maxRetries) {
        throw error;
      }
      
      // Check if this is a Facebook API error we should retry
      const isRetryable = error.response?.data?.error?.code === 613 || // Rate limit error 
                          error.response?.data?.error?.code === 2 ||   // Temporary error
                          error.response?.status === 500 ||           // Internal Server Error
                          error.response?.status === 502 ||           // Bad Gateway
                          error.code === 'ECONNRESET' ||              // Connection reset
                          error.code === 'ETIMEDOUT';                 // Timeout
      
      if (!isRetryable) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        options.initialDelay * Math.pow(options.factor, retries) * 
        (1 + Math.random() * options.jitter),
        options.maxDelay
      );
      
      console.log(`API error (${error.response?.data?.error?.code || error.code || error.message}). Retrying in ${Math.round(delay / 1000)} seconds...`);
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default retryWithBackoff; 