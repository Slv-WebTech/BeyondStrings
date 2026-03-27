/**
 * Performance optimization utilities for handling large datasets
 */

/**
 * Memoize with timeout - Cache result for specified duration
 */
export function memoizeWithTimeout(fn, timeoutMs = 5000) {
    let cached = null;
    let timestamp = 0;

    return function (...args) {
        const now = Date.now();
        if (cached !== null && now - timestamp < timeoutMs) {
            return cached;
        }

        try {
            cached = fn.apply(this, args);
            timestamp = now;
            return cached;
        } catch (error) {
            console.warn('Memoize function error:', error);
            return cached; // Return stale cache on error
        }
    };
}

/**
 * Debounce function calls
 */
export function debounce(fn, delay = 300) {
    let timeoutId = null;

    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            try {
                fn.apply(this, args);
            } catch (error) {
                console.warn('Debounce function error:', error);
            }
        }, delay);
    };
}

/**
 * Throttle function calls
 */
export function throttle(fn, delay = 300) {
    let lastCall = 0;
    let timeoutId = null;

    return function (...args) {
        const now = Date.now();

        if (now - lastCall < delay) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                try {
                    fn.apply(this, args);
                } catch (error) {
                    console.warn('Throttle function error:', error);
                }
            }, delay - (now - lastCall));

            return;
        }

        lastCall = now;
        try {
            fn.apply(this, args);
        } catch (error) {
            console.warn('Throttle function error:', error);
        }
    };
}

/**
 * Batch array operations for large datasets
 */
export async function batchProcess(array, processor, batchSize = 100) {
    if (!Array.isArray(array)) {
        return [];
    }

    const results = [];

    for (let i = 0; i < array.length; i += batchSize) {
        const batch = array.slice(i, i + batchSize);

        try {
            const batchResults = await Promise.all(batch.map((item) => processor(item)));
            results.push(...batchResults);
        } catch (error) {
            console.warn(`Batch processing error at index ${i}:`, error);
            // Continue with next batch
        }

        // Yield to event loop
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return results;
}

/**
 * Virtualize list rendering for large datasets
 */
export function virtualizeItems(items, itemHeight, containerHeight, scrollOffset = 0) {
    if (!Array.isArray(items) || items.length === 0) {
        return { visibleItems: [], startIndex: 0, endIndex: 0 };
    }

    const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight));
    const endIndex = Math.min(items.length, Math.ceil((scrollOffset + containerHeight) / itemHeight) + 1);

    return {
        visibleItems: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
        offsetY: startIndex * itemHeight
    };
}

/**
 * Compress data structure
 */
export function compressObject(obj, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) {
        return '[deep]';
    }

    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.slice(0, 100).map((item) => compressObject(item, depth + 1, maxDepth));
    }

    const compressed = {};
    for (const key of Object.keys(obj).slice(0, 50)) {
        compressed[key] = compressObject(obj[key], depth + 1, maxDepth);
    }

    return compressed;
}

/**
 * Create weak callback for cleanup
 */
export function createWeakCallback(fn) {
    if (typeof FinalizationRegistry === 'undefined') {
        return fn;
    }

    try {
        const registry = new FinalizationRegistry(() => {
            console.log('Resource cleaned up');
        });

        return {
            callback: fn,
            register: (object) => {
                registry.register(object, 'cleanup');
            }
        };
    } catch (error) {
        return fn;
    }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
    if (typeof performance === 'undefined' || !performance.memory) {
        return null;
    }

    try {
        const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = performance.memory;

        return {
            limit: jsHeapSizeLimit,
            total: totalJSHeapSize,
            used: usedJSHeapSize,
            percentage: Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100)
        };
    } catch (error) {
        return null;
    }
}

/**
 * Check if memory usage is critical
 */
export function isHighMemoryUsage(threshold = 90) {
    const usage = getMemoryUsage();
    return usage ? usage.percentage > threshold : false;
}
