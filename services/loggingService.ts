// Firebase dependencies are no longer needed for console logging.

interface LogContext {
    [key: string]: any;
}

/**
 * Logs an informational message to the console (stdout).
 * @param message The message to log.
 * @param context Optional additional data.
 */
export const logInfo = (message: string, context?: LogContext): void => {
    if (context) {
        console.log(`[INFO] ${message}`, context);
    } else {
        console.log(`[INFO] ${message}`);
    }
};

/**
 * Logs an error to the console (stdout).
 * @param error The error object.
 * @param context Optional additional data to understand the error context.
 */
export const logError = (error: any, context?: LogContext): void => {
    console.error(`[ERROR] An error occurred.`);
    if (context) {
        console.error('Context:', context);
    }
    console.error('Error Details:', error);
};
