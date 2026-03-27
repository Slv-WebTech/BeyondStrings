import { createLocalSummary } from './localSummary';

function toChatTranscript(messages) {
    return messages
        .slice(-150)
        .map((m) => `${m.date} ${m.time} - ${m.sender || 'System'}: ${m.message}`)
        .join('\n');
}

async function summarizeWithOpenAI(lastMessages, apiKey) {
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
        return '';
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function summarizeWithOllama(lastMessages) {
    const ollamaBaseUrl = (import.meta.env.VITE_OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
    const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b';
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: ollamaModel,
                stream: false,
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
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            return '';
        }

        const data = await response.json();
        return data?.message?.content?.trim() || '';
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export async function summarizeMessagesWithAI(messages) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim();

    if (!messages || messages.length === 0) {
        return 'No messages available for summary.';
    }

    const lastMessages = toChatTranscript(messages);

    try {
        if (apiKey) {
            const openAISummary = await summarizeWithOpenAI(lastMessages, apiKey);
            if (openAISummary) {
                return openAISummary;
            }
        }

        const ollamaSummary = await summarizeWithOllama(lastMessages);
        if (ollamaSummary) {
            return ollamaSummary;
        }

        return createLocalSummary(messages);
    } catch (error) {
        return createLocalSummary(messages);
    }
}
