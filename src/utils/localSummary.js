function detectTone(messages) {
    const joined = messages.map((m) => (m.message || '').toLowerCase()).join(' ');

    const positiveWords = ['great', 'good', 'thanks', 'happy', 'awesome', 'love', 'yes'];
    const negativeWords = ['bad', 'sad', 'sorry', 'problem', 'no', 'angry', 'hate'];

    const positiveScore = positiveWords.reduce(
        (total, word) => total + (joined.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length,
        0
    );

    const negativeScore = negativeWords.reduce(
        (total, word) => total + (joined.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length,
        0
    );

    if (positiveScore === 0 && negativeScore === 0) {
        return 'neutral';
    }
    if (positiveScore > negativeScore) {
        return 'mostly positive';
    }
    if (negativeScore > positiveScore) {
        return 'mostly tense';
    }

    return 'balanced';
}

export function createLocalSummary(messages) {
    if (!messages || messages.length === 0) {
        return 'No messages available for summary.';
    }

    const userActivity = messages.reduce((acc, message) => {
        if (!message.sender) {
            return acc;
        }
        acc[message.sender] = (acc[message.sender] || 0) + 1;
        return acc;
    }, {});

    const activeUsers = Object.entries(userActivity).sort((a, b) => b[1] - a[1]);
    const mostActiveUser = activeUsers.length ? activeUsers[0][0] : 'Unknown';
    const sampleMessages = messages
        .filter((m) => !m.isSystem)
        .slice(-3)
        .map((m) => `- ${m.sender}: ${m.message.split('\n')[0].slice(0, 110)}`)
        .join('\n');

    return [
        `Total messages: ${messages.length}`,
        `Most active user: ${mostActiveUser}`,
        `Conversation tone: ${detectTone(messages)}`,
        'Sample recent messages:',
        sampleMessages || '- No sample messages available.'
    ].join('\n');
}
