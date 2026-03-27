/**
 * Chat data sanitization and transformation utilities
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Escape special characters for regex
 */
export function escapeRegex(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize whitespace in text
 */
export function normalizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n')
        .replace(/\t/g, '  ') // Replace tabs with spaces
        .replace(/\u0000/g, '') // Remove null characters
        .replace(/[ ]+/g, ' ') // Collapse multiple spaces
        .trim();
}

/**
 * Extract URLs from text
 */
export function extractURLs(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const urlRegex = /https?:\/\/[^\s]+/gi;
    const matches = text.match(urlRegex) || [];

    return matches
        .map((url) => {
            try {
                new URL(url);
                return url;
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}

/**
 * Extract mentions from text
 */
export function extractMentions(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const mentionRegex = /@[\w-]+/g;
    return (text.match(mentionRegex) || []).map((m) => m.slice(1));
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const hashtagRegex = /#[\w-]+/g;
    return (text.match(hashtagRegex) || []).map((m) => m.slice(1));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || typeof text !== 'string') {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Count words in text
 */
export function countWords(text) {
    if (!text || typeof text !== 'string') {
        return 0;
    }

    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
}

/**
 * Sanitize message object
 */
export function sanitizeMessage(message) {
    if (!message || typeof message !== 'object') {
        return null;
    }

    return {
        id: String(message.id || '').slice(0, 100),
        date: String(message.date || '').slice(0, 20),
        time: String(message.time || '').slice(0, 12),
        sender: message.sender ? String(message.sender).slice(0, 100) : null,
        message: String(message.message || '').slice(0, 10000),
        isSystem: Boolean(message.isSystem)
    };
}

/**
 * Validate and clean message array
 */
export function cleanMessageArray(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    const cleaned = [];
    const seenIds = new Set();

    for (const message of messages) {
        try {
            const sanitized = sanitizeMessage(message);
            if (!sanitized) continue;

            // Prevent duplicates
            if (seenIds.has(sanitized.id)) {
                continue;
            }

            cleaned.push(sanitized);
            seenIds.add(sanitized.id);

            // Limit array size
            if (cleaned.length >= 100000) {
                console.warn('Message array truncated at limit');
                break;
            }
        } catch (error) {
            console.warn('Message sanitization error:', error, message);
        }
    }

    return cleaned;
}

/**
 * Detect language of text
 */
export function detectLanguageHint(text) {
    if (!text || typeof text !== 'string') {
        return 'unknown';
    }

    // Simple heuristic detection
    if (/[\u0600-\u06FF]/.test(text)) {
        return 'arabic';
    }
    if (/[\u0E00-\u0E7F]/.test(text)) {
        return 'thai';
    }
    if (/[\u4E00-\u9FFF]/.test(text)) {
        return 'chinese';
    }
    if (/[\uAC00-\uD7AF]/.test(text)) {
        return 'korean';
    }
    if (/[\u0900-\u097F]/.test(text)) {
        return 'devanagari';
    }

    return 'latin';
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Parse file metadata
 */
export function parseFileMetadata(file) {
    if (!file || !(file instanceof File)) {
        return null;
    }

    try {
        const nameParts = file.name.split('.');
        const extension = nameParts.pop()?.toLowerCase() || '';

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            extension,
            lastModified: file.lastModified,
            lastModifiedDate: new Date(file.lastModified),
            sizeFormatted: formatFileSize(file.size)
        };
    } catch (error) {
        console.warn('File metadata parsing error:', error);
        return null;
    }
}
