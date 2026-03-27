/**
 * Error handling and recovery utilities
 */

/**
 * Create a safe error boundary wrapper
 */
export class ErrorBoundary extends Error {
    constructor(context, originalError) {
        super(`Error in ${context}: ${originalError?.message || 'Unknown error'}`);
        this.context = context;
        this.originalError = originalError;
        this.timestamp = new Date();
    }
}

/**
 * Safely wrap async operations with error handling
 */
export async function safeAsync(asyncFn, context = 'unknown operation') {
    try {
        return await asyncFn();
    } catch (error) {
        console.error(`Safe async failed in ${context}:`, error);
        return null;
    }
}

/**
 * Rate-limited error logger (prevent console spam)
 */
class RateLimitedLogger {
    constructor(maxPerSecond = 5) {
        this.maxPerSecond = maxPerSecond;
        this.errors = {};
    }

    logError(context, error) {
        const key = `${context}-${String(error).slice(0, 50)}`;
        const now = Date.now();

        if (!this.errors[key]) {
            this.errors[key] = { count: 0, lastTime: now };
        }

        const entry = this.errors[key];

        // Reset counter if more than 1 second has passed
        if (now - entry.lastTime > 1000) {
            entry.count = 0;
            entry.lastTime = now;
        }

        if (entry.count < this.maxPerSecond) {
            entry.count++;
            console.error(`[${context}]`, error);
        } else if (entry.count === this.maxPerSecond) {
            entry.count++;
            console.warn(`[${context}] Error throttled - too many similar errors`);
        }
    }
}

export const errorLogger = new RateLimitedLogger(5);

/**
 * Attempt operation with fallback
 */
export function withFallback(operation, fallback, context = 'operation') {
    try {
        return operation();
    } catch (error) {
        errorLogger.logError(context, error);
        return fallback;
    }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff(
    asyncFn,
    maxAttempts = 3,
    baseDelay = 100,
    context = 'retry operation'
) {
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;

            if (attempt < maxAttempts - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    errorLogger.logError(context, lastError);
    return null;
}

/**
 * Validate and parse operation with error recovery
 */
export function parseWithRecovery(parser, input, fallback, context = 'parse') {
    if (!parser || typeof parser !== 'function') {
        console.error(`Invalid parser in ${context}`);
        return fallback;
    }

    try {
        const result = parser(input);
        if (!result) {
            return fallback;
        }
        return result;
    } catch (error) {
        errorLogger.logError(context, error);
        return fallback;
    }
}

/**
 * Create error recovery report
 */
export function createErrorReport(context, error, additionalInfo = {}) {
    return {
        context,
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
        stack: error?.stack,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        ...additionalInfo
    };
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error) {
    if (!error) return true; // Treat no error as recoverable

    const message = String(error?.message || '').toLowerCase();
    const unrecoverablePatterns = [
        'out of memory',
        'stack overflow',
        'maximum call stack size exceeded',
        'fatal'
    ];

    return !unrecoverablePatterns.some((pattern) => message.includes(pattern));
}
