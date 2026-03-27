function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getHighlightParts(text, query) {
    if (!query || !query.trim()) {
        return [{ text, match: false }];
    }

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
    const chunks = String(text).split(regex);

    return chunks.filter(Boolean).map((chunk) => ({
        text: chunk,
        match: chunk.toLowerCase() === query.toLowerCase()
    }));
}

export function includesQuery(text, query) {
    if (!query || !query.trim()) {
        return false;
    }

    return String(text).toLowerCase().includes(query.toLowerCase());
}
