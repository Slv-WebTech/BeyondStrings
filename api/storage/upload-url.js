import { getStorage } from 'firebase-admin/storage';
import { authenticate } from '../_lib/rbac.js';
import { getFirebaseAdminApp } from '../_lib/firebaseAdmin.js';

function sanitizeFileName(fileName) {
    return String(fileName || '')
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 120);
}

const ALLOWED_TYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    // Audio
    'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/wav', 'audio/aac', 'audio/flac',
    // Video
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    // Documents
    'application/pdf'
]);

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB for video; encrypted overhead is ~33% larger

function getMaxSizeForType(contentType) {
    if (contentType.startsWith('video/')) return 100 * 1024 * 1024;
    if (contentType.startsWith('audio/')) return 25 * 1024 * 1024;
    return 10 * 1024 * 1024; // images / pdf
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const user = await authenticate(req, res);
    if (!user) return;

    const fileName = sanitizeFileName(req.body?.fileName);
    const contentType = String(req.body?.contentType || '').trim().toLowerCase();
    const fileSize = Number(req.body?.fileSize || 0);
    const roomId = String(req.body?.roomId || '').trim().slice(0, 128);

    if (!roomId) {
        return res.status(400).json({ error: 'roomId is required.' });
    }
    if (!fileName) {
        return res.status(400).json({ error: 'fileName is required.' });
    }
    if (!ALLOWED_TYPES.has(contentType)) {
        return res.status(400).json({ error: 'Unsupported file type.' });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > getMaxSizeForType(contentType)) {
        return res.status(400).json({ error: 'File size exceeds allowed limit.' });
    }

    try {
        const app = getFirebaseAdminApp();
        const bucket = getStorage(app).bucket(process.env.FIREBASE_STORAGE_BUCKET || undefined);
        const objectPath = `rooms/${roomId}/uploads/${user.uid}/${Date.now()}-${fileName}`;
        const file = bucket.file(objectPath);

        // Always sign for application/octet-stream — the client uploads the
        // AES-GCM encrypted blob regardless of the original file type.
        // The original contentType is validated above and stored in the message
        // payload (mediaMime) so the receiver knows how to render after decryption.
        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType: 'application/octet-stream'
        });

        return res.status(200).json({
            uploadUrl: signedUrl,
            objectPath,
            maxBytes: getMaxSizeForType(contentType)
        });
    } catch (error) {
        console.error('[storage/upload-url]', error.message);
        return res.status(500).json({ error: 'Could not generate upload URL.' });
    }
}
