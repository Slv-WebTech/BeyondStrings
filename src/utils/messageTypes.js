function normalizedMessage(message) {
    return String(message || '').trim().toLowerCase();
}

export function classifyMessage(message) {
    const content = normalizedMessage(message?.message);

    if (message?.isSystem) {
        return 'system';
    }

    if (
        content.includes('missed voice call') ||
        content.includes('missed video call') ||
        content.includes('voice call') ||
        content.includes('video call')
    ) {
        return 'call';
    }

    if (
        content.includes('audio omitted') ||
        content.includes('voice message omitted') ||
        content.includes('voice note')
    ) {
        return 'voice';
    }

    if (
        content.includes('<media omitted>') ||
        content.includes('image omitted') ||
        content.includes('video omitted') ||
        content.includes('document omitted') ||
        content.includes('sticker omitted') ||
        content.includes('gif omitted') ||
        content.includes('attachment') ||
        getResolvableMediaSource(message)
    ) {
        return 'media';
    }

    return 'text';
}

export function getCallDetails(message) {
    const content = normalizedMessage(message?.message);
    const isVideo = content.includes('video');
    const isMissed = content.includes('missed');

    return {
        icon: isVideo ? 'video' : 'phone',
        label: isMissed ? (isVideo ? 'Missed video call' : 'Missed voice call') : isVideo ? 'Video call' : 'Voice call'
    };
}

export function getMediaLabel(message) {
    const content = normalizedMessage(message?.message);

    if (content.includes('image')) {
        return 'Image attachment';
    }
    if (content.includes('video')) {
        return 'Video attachment';
    }
    if (content.includes('document')) {
        return 'Document attachment';
    }
    if (content.includes('sticker')) {
        return 'Sticker attachment';
    }

    return 'Attachment';
}

export function getVoiceDuration(message) {
    const content = String(message?.message || '');
    const match = content.match(/(\d{1,2}:\d{2})/);
    return match?.[1] || '0:14';
}

export function getResolvableMediaSource(message) {
    const content = String(message?.message || '');
    const dataUrlMatch = content.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[a-zA-Z0-9+/=\s]+/);
    if (dataUrlMatch) {
        return dataUrlMatch[0].replace(/\s/g, '');
    }

    const urlMatch = content.match(/https?:\/\/[^\s)"']+\.(?:png|jpe?g|gif|webp|avif|bmp)(?:\?[^\s"']*)?/i);
    if (urlMatch) {
        return urlMatch[0];
    }

    const genericUrlMatch = content.match(/https?:\/\/[^\s)"']+/i);
    if (genericUrlMatch && /image|photo|img|cdn/i.test(genericUrlMatch[0])) {
        return genericUrlMatch[0];
    }

    return null;
}