import { createLocalSummary } from './localSummary';

export async function summarizeMessagesWithAI(messages) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!messages || messages.length === 0) {
        return 'No messages available for summary.';
    }

    if (!apiKey) {
        return createLocalSummary(messages);
    }

    const lastMessages = messages
        .slice(-150)
        .map((m) => `${m.date} ${m.time} - ${m.sender || 'System'}: ${m.message}`)
        .join('\n');

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.2,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You summarize WhatsApp chats. Provide: key topics, user activity, sentiment, and action points in concise bullet points.'
                    },
                    {
                        role: 'user',
                        content: `Summarize this WhatsApp chat:\n\n${lastMessages}`
                    }
                ]
            })
        });

        if (!response.ok) {
            return createLocalSummary(messages);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content?.trim() || createLocalSummary(messages);
    } catch (error) {
        return createLocalSummary(messages);
    }
}
