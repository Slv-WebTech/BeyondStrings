/**
 * api/storage/upload.js
 *
 * Receives the AES-GCM encrypted blob as a raw binary POST body.
 * Metadata is passed as query-string parameters so we avoid multipart
 * parsing entirely (Vercel buffers raw bodies automatically).
 *
 * POST /api/storage/upload?roomId=&fileName=&mimeType=&fileSize=
 *   Content-Type: application/octet-stream
 *   Body: raw encrypted bytes
 *
 * Storage backend: Supabase Storage (free, no credit card required)
 */

import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../_lib/rbac.js';

function sanitizeFileName(fileName) {
    return String(fileName || '')
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 120);
}

const ALLOWED_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/aac', 'audio/flac',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'application/pdf'
]);

function getMaxSizeForType(mimeType) {
    if (mimeType.startsWith('video/')) return 100 * 1024 * 1024;
    if (mimeType.startsWith('audio/')) return 25 * 1024 * 1024;
    return 10 * 1024 * 1024;
}

function readRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

let _supabase = null;
function getSupabase() {
    if (_supabase) return _supabase;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    _supabase = createClient(url, key, { auth: { persistSession: false } });
    return _supabase;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const user = await authenticate(req, res);
    if (!user) return;

    try {
        const roomId = String(req.query?.roomId ?? '').trim().slice(0, 128);
        const fileName = sanitizeFileName(req.query?.fileName ?? '');
        const mimeType = String(req.query?.mimeType ?? '').trim().toLowerCase();
        const fileSize = Number(req.query?.fileSize ?? 0);

        if (!roomId) return res.status(400).json({ error: 'roomId is required.' });
        if (!fileName) return res.status(400).json({ error: 'fileName is required.' });
        if (!ALLOWED_TYPES.has(mimeType)) return res.status(400).json({ error: 'Unsupported file type.' });
        if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > getMaxSizeForType(mimeType)) {
            return res.status(400).json({ error: 'File size exceeds allowed limit.' });
        }

        const bodyBuffer = await readRawBody(req);
        if (!bodyBuffer.length) return res.status(400).json({ error: 'Empty file body.' });

        const supabase = getSupabase();
        const objectPath = `rooms/${roomId}/uploads/${user.uid}/${Date.now()}-${fileName}`;
        const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media';

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(objectPath, bodyBuffer, {
                contentType: 'application/octet-stream',
                upsert: false
            });

        if (error) {
            console.error('[storage/upload] Supabase error:', error.message);
            return res.status(500).json({ error: 'Upload failed. Please try again.' });
        }

        return res.status(200).json({ objectPath });
    } catch (err) {
        console.error('[storage/upload]', err.message);
        return res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
}
