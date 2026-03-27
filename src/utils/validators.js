/**
 * Comprehensive validation utilities for handling edge cases
 */

/**
 * Safely extract date parts with fallback handling
 * Handles malformed dates, invalid months/days, etc.
 */
export function safeParseDateParts(dateText) {
    if (!dateText || typeof dateText !== 'string') {
        return null;
    }

    const raw = dateText.trim();
    const match = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);

    if (!match) {
        return null;
    }

    let day = Number(match[1]);
    let month = Number(match[2]);
    let year = Number(match[3]);

    // Normalize year
    if (year < 100) {
        year = 2000 + year;
    }

    // Clamp month to valid range (1-12)
    if (month < 1 || month > 12) {
        return null;
    }

    // Clamp day to valid range (1-31)
    if (day < 1 || day > 31) {
        return null;
    }

    // Further validate day based on month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        daysInMonth[1] = 29;
    }

    if (day > daysInMonth[month - 1]) {
        return null;
    }

    return { day, month, year };
}

/**
 * Safely parse time with fallback
 */
export function safeParseTime(timeText) {
    if (!timeText || typeof timeText !== 'string') {
        return null;
    }

    const trimmed = timeText.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?$/i);

    if (!match) {
        return null;
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || 0);
    const meridiem = match[4]?.toLowerCase();

    // Validate hour/minute/second ranges
    if (hour > 23 || minute > 59 || second > 59) {
        return null;
    }

    if (meridiem === 'pm' && hour !== 12) {
        hour += 12;
    }
    if (meridiem === 'am' && hour === 12) {
        hour = 0;
    }

    // Re-validate after meridiem conversion
    if (hour > 23) {
        return null;
    }

    return { hour, minute, second };
}

/**
 * Safely create a date from parsed parts with validation
 */
export function createValidDate(parts) {
    if (!parts || !parts.day || !parts.month || !parts.year) {
        return null;
    }

    try {
        const date = new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0, 0);

        // Verify the date was created correctly (month boundary checks)
        if (date.getDate() !== parts.day || date.getMonth() !== parts.month - 1 || date.getFullYear() !== parts.year) {
            return null;
        }

        return date;
    } catch (error) {
        return null;
    }
}

/**
 * Validate message structure
 */
export function isValidMessage(message) {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const { date, time, sender, message: text, id } = message;

    // Must have id
    if (!id || typeof id !== 'string') {
        return false;
    }

    // Must have valid date
    if (!safeParseDateParts(date)) {
        return false;
    }

    // Must have valid time
    if (!safeParseTime(time)) {
        return false;
    }

    // Text should be string (can be empty)
    if (text !== undefined && typeof text !== 'string') {
        return false;
    }

    // Sender can be empty for system messages
    if (sender !== undefined && sender !== null && typeof sender !== 'string') {
        return false;
    }

    return true;
}

/**
 * Safely get message text with length limit
 */
export function getSafeMessageText(message, maxLength = 5000) {
    if (!message) {
        return '';
    }

    let text = String(message.message || message.text || '');

    // Truncate very long messages
    if (text.length > maxLength) {
        text = text.slice(0, maxLength) + '... [truncated]';
    }

    return text;
}

/**
 * Safely get sender name with sanitization
 */
export function getSafeSenderName(sender) {
    if (!sender) {
        return 'Unknown';
    }

    let name = String(sender).trim();

    // Remove leading/trailing special characters
    name = name.replace(/^[^\w\s]+|[^\w\s]+$/g, '');

    // Limit length
    if (name.length > 100) {
        name = name.slice(0, 100);
    }

    return name || 'Unknown';
}

/**
 * Validate array of messages
 */
export function validateMessageArray(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    // Filter out invalid entries
    return messages.filter((msg) => {
        try {
            return isValidMessage(msg);
        } catch (error) {
            console.warn('Invalid message filtered:', msg, error);
            return false;
        }
    });
}

/**
 * Safely get localStorage value with fallback
 */
export function getSafeLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.warn(`localStorage access failed for key: ${key}`, error);
        return defaultValue;
    }
}

/**
 * Safely set localStorage value
 */
export function setSafeLocalStorage(key, value) {
    try {
        localStorage.setItem(key, String(value));
        return true;
    } catch (error) {
        console.warn(`localStorage write failed for key: ${key}`, error);
        return false;
    }
}

/**
 * Validate and clamp numeric value
 */
export function clampNumber(value, min = 0, max = 100) {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return min;
    }
    return Math.max(min, Math.min(max, num));
}

/**
 * Safely parse slider/progress value
 */
export function parseScrubValue(value, maxValue) {
    const parsed = clampNumber(value, 0, maxValue);
    return Math.floor(parsed);
}

/**
 * Validate zoom level
 */
export function getValidZoomLevel(value, defaultZoom = 'auto') {
    const valid = ['auto', 'day', 'month', 'year'];
    return valid.includes(value) ? value : defaultZoom;
}

/**
 * Check if value is a valid speed multiplier
 */
export function getValidSpeed(speed) {
    const speeds = [1000, 500, 200]; // Corresponds to 0.5x, 1x, 2x
    return speeds.includes(speed) ? speed : 500; // Default to 1x
}

/**
 * Validate and sanitize URL
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch (error) {
        return false;
    }
}

/**
 * Get safe image URL with fallback
 */
export function getSafeImageUrl(url, fallback = '') {
    return isValidImageUrl(url) ? url : fallback;
}

/**
 * Check if viewport is mobile
 */
export function isMobileViewport(width = window.innerWidth) {
    return width <= 640;
}

/**
 * Safely access nested object property
 */
export function deepGet(obj, path, defaultValue = null) {
    try {
        const value = path
            .split('.')
            .reduce((current, key) => (current ? current[key] : undefined), obj);
        return value !== undefined ? value : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}
