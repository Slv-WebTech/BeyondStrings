/**
 * Edge Case Testing Utilities
 * Use these to test and validate all edge cases
 */

/**
 * Generate test data with edge cases
 */
export const EdgeCaseTestData = {
    // Valid baseline
    validMessage: {
        id: 'test-1',
        date: '01/01/2024',
        time: '12:30 pm',
        sender: 'John',
        message: 'Hello World',
        isSystem: false
    },

    // Date edge cases
    invalidDates: [
        '02/30/2024', // Feb 30
        '13/01/2024', // Month 13
        '01/32/2024', // Day 32
        '00/01/2024', // Day 0
        '01/00/2024', // Month 0
        'invalid',
        '',
        null,
        undefined
    ],

    // Time edge cases
    invalidTimes: [
        '25:00:00', // Hour 25
        '12:60:00', // Minute 60
        '12:30:60', // Second 60
        '25:70:80',
        'invalid',
        '',
        null,
        undefined
    ],

    // Message edge cases
    invalidMessages: [
        null,
        undefined,
        {}, // Missing required fields
        { id: 'test' }, // Missing date/time
        { id: 'test', date: '01/01/2024' }, // Missing time
        { id: 'test', date: '01/01/2024', time: '12:00' }, // Missing sender and message
        {
            id: 'test',
            date: 'invalid-date',
            time: '12:00',
            sender: 'John',
            message: 'Test'
        }, // Invalid date
        {
            id: 'test',
            date: '01/01/2024',
            time: 'invalid-time',
            sender: 'John',
            message: 'Test'
        } // Invalid time
    ],

    // Large message edge cases
    extremeLongMessage: {
        id: 'long-test',
        date: '01/01/2024',
        time: '12:30',
        sender: 'John',
        message: 'Lorem ipsum '.repeat(1000), // ~12KB
        isSystem: false
    },

    // Empty message
    emptyMessage: {
        id: 'empty-test',
        date: '01/01/2024',
        time: '12:30',
        sender: 'John',
        message: '',
        isSystem: false
    },

    // System message (no sender)
    systemMessage: {
        id: 'sys-test',
        date: '01/01/2024',
        time: '12:30',
        sender: null,
        message: 'You created a group',
        isSystem: true
    },

    // Special characters
    specialCharMessage: {
        id: 'special-test',
        date: '01/01/2024',
        time: '12:30',
        sender: 'John',
        message: '🎉 emoji test @mention #hashtag https://example.com',
        isSystem: false
    },

    // RTL text
    rtlMessage: {
        id: 'rtl-test',
        date: '01/01/2024',
        time: '12:30',
        sender: 'أحمد',
        message: 'مرحبا بك في التطبيق',
        isSystem: false
    },

    // Very long sender name
    longSenderMessage: {
        id: 'sender-test',
        date: '01/01/2024',
        time: '12:30',
        sender: 'A'.repeat(200), // 200 chars
        message: 'Test',
        isSystem: false
    },

    // Date edge cases - boundary years
    boundaryDateMessages: [
        {
            id: 'year-1900',
            date: '01/01/1900',
            time: '00:00',
            sender: 'Old User',
            message: 'Ancient message',
            isSystem: false
        },
        {
            id: 'year-2099',
            date: '12/31/2099',
            time: '23:59',
            sender: 'Future User',
            message: 'Future message',
            isSystem: false
        },
        {
            id: 'leap-year',
            date: '02/29/2024',
            time: '12:00',
            sender: 'Leap Year User',
            message: 'Happy leap day',
            isSystem: false
        },
        {
            id: 'non-leap-year',
            date: '02/29/2023', // Invalid - 2023 is not a leap year
            time: '12:00',
            sender: 'User',
            message: 'This should fail',
            isSystem: false
        }
    ],

    // Time format variations
    timeFormatMessages: [
        {
            id: 'time-1',
            date: '01/01/2024',
            time: '12:30 AM',
            sender: 'User',
            message: 'Midnight',
            isSystem: false
        },
        {
            id: 'time-2',
            date: '01/01/2024',
            time: '12:30 PM',
            sender: 'User',
            message: 'Noon',
            isSystem: false
        },
        {
            id: 'time-3',
            date: '01/01/2024',
            time: '12:30:45',
            sender: 'User',
            message: 'With seconds',
            isSystem: false
        },
        {
            id: 'time-4',
            date: '01/01/2024',
            time: '00:00',
            sender: 'User',
            message: 'Midnight 24h',
            isSystem: false
        },
        {
            id: 'time-5',
            date: '01/01/2024',
            time: '23:59:59',
            sender: 'User',
            message: 'End of day',
            isSystem: false
        }
    ]
};

/**
 * Create test cases for parser
 */
export function createParserTestData() {
    return {
        // Empty/null files
        emptyFile: '',
        spaces: '   \n  \n  ',

        // Malformed
        oneLine: 'Just one line, no proper format',
        noTimestamp: 'Some text without timestamps',

        // Valid samples
        singleMessage: '1/1/2024, 12:30 - User: Hello',
        multipleMessages: `
1/1/2024, 12:30 - User1: First message
1/1/2024, 12:45 - User2: Second message
1/2/2024, 13:00 - User1: Next day message
        `,

        // Bracket format
        bracketFormat: `
[1/1/2024, 12:30] User: Message with brackets
[1/1/2024, 12:45] System message format
        `,

        // Mixed formats
        mixedFormat: `
1/1/2024, 12:30 - User1: First format
[1/1/2024, 12:45] User2: Second format
1/2/2024, 13:00 - User1: Back to first
        `,

        // Multi-line messages
        multilineMsg: `
1/1/2024, 12:30 - User: First line
of message continues
and continues more
1/1/2024, 12:45 - User2: Next message
        `,

        // Special characters
        specialChars: `
1/1/2024, 12:30 - User: Message with emoji 🎉
1/1/2024, 12:45 - User: URL: https://example.com
1/1/2024, 13:00 - User: @mention #hashtag
        `,

        // Edge dates
        edgeDates: `
1/1/1900, 00:00 - Old: Ancient message
2/29/2024, 12:00 - Leap: Leap day message
12/31/2099, 23:59 - Future: End of century
        `,

        // Extreme length lines
        extremeLongLine: '1/1/2024, 12:30 - User: ' + 'A'.repeat(10000),
    };
}

/**
 * Test validation functions
 */
export async function runEdgeCaseTests() {
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };

    // Import validators (in real scenario)
    console.log('Running edge case tests...');
    console.log('Test data available via EdgeCaseTestData export');

    return results;
}

/**
 * Generate a chat with specific characteristics for testing
 */
export function generateTestChat(options = {}) {
    const {
        messageCount = 100,
        daySpan = 30,
        userCount = 2,
        includeSystemMessages = true,
        includeSpecialChars = false,
        includeRTL = false,
        includeErrors = false
    } = options;

    const messages = [];
    const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const selectedUsers = users.slice(0, Math.max(2, userCount));

    for (let i = 0; i < messageCount; i++) {
        const daysOffset = Math.floor(Math.random() * daySpan);
        const date = new Date(2024, 0, 1 + daysOffset);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (includeSystemMessages && Math.random() < 0.05) {
            messages.push({
                id: `msg-${i}`,
                date: dateStr,
                time: timeStr,
                sender: null,
                message: 'User joined',
                isSystem: true
            });
        } else {
            let message = `Message ${i}: `;

            if (includeSpecialChars) {
                message += '🎉 with emoji @mention #hashtag https://test.com';
            } else if (includeRTL) {
                message += 'رسالة اختبار في اللغة العربية';
            } else {
                message += Math.random() > 0.5 ? 'Short' : 'This is a longer test message with more content';
            }

            if (includeErrors && Math.random() < 0.01) {
                message = 'X'.repeat(15000); // Very long message
            }

            messages.push({
                id: `msg-${i}`,
                date: dateStr,
                time: timeStr,
                sender: selectedUsers[Math.floor(Math.random() * selectedUsers.length)],
                message,
                isSystem: false
            });
        }
    }

    return { messages, users: selectedUsers };
}

/**
 * Simulate various error conditions
 */
export const ErrorSimulation = {
    // Simulate parser errors
    simulateParseError: () => {
        throw new Error('Parse failed: Malformed date');
    },

    // Simulate storage errors
    simulateStorageError: () => {
        try {
            localStorage.setItem('x', 'y');
        } catch {
            throw new Error('Storage quota exceeded');
        }
    },

    // Simulate memory pressure
    simulateMemoryPressure: () => {
        const arrays = [];
        try {
            for (let i = 0; i < 1000; i++) {
                arrays.push(new Float64Array(1000000));
            }
        } catch {
            throw new Error('Out of memory');
        }
    },

    // Simulate timeout
    simulateTimeout: async () => {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), 100);
        });
    }
};

export default {
    EdgeCaseTestData,
    createParserTestData,
    runEdgeCaseTests,
    generateTestChat,
    ErrorSimulation
};
