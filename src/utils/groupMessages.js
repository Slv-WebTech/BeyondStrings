export function groupMessages(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];

        const sameAsPrev =
            prev &&
            !message.isSystem &&
            !prev.isSystem &&
            prev.sender === message.sender;

        const sameAsNext =
            next &&
            !message.isSystem &&
            !next.isSystem &&
            next.sender === message.sender;

        return {
            ...message,
            isGrouped: Boolean(sameAsPrev),
            showAvatar: !sameAsPrev,
            isGroupEnd: !sameAsNext
        };
    });
}
