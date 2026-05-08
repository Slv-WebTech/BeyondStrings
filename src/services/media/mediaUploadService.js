/**
 * mediaUploadService.js
 *
 * Client-side encrypted media upload for BeyondStrings.
 *
 * Flow:
 *  1. Generate a random AES-GCM 256-bit key (per-file — never leaves the client except
 *     as part of the encrypted Firestore message, which is itself encrypted by the room secret).
 *  2. Encrypt the file bytes with that key.
 *  3. Request a signed upload URL from /api/storage/upload-url.
 *  4. PUT the encrypted blob to Firebase Storage via the signed URL.
 *  5. Return { objectPath, mediaKey } — the caller stores these in the message payload.
 *
 * On download:
 *  1. Fetch the encrypted blob from the signed download URL.
 *  2. Decrypt with the stored mediaKey.
 *  3. Create an object URL for rendering.
 */

const API_BASE = String(import.meta.env.PUBLIC_API_BASE_URL || '/api').replace(/\/$/, '');

// ─── Crypto helpers ──────────────────────────────────────────────────────────

async function generateFileKey() {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function exportKeyAsBase64(cryptoKey) {
    const raw = await crypto.subtle.exportKey('raw', cryptoKey);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

async function importKeyFromBase64(b64) {
    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
}

async function encryptBytes(cryptoKey, data) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    // Prepend IV (12 bytes) to ciphertext
    const combined = new Uint8Array(12 + cipherBuf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuf), 12);
    return combined.buffer;
}

async function decryptBytes(cryptoKey, data) {
    const buf = data instanceof ArrayBuffer ? data : await data.arrayBuffer();
    const iv = new Uint8Array(buf, 0, 12);
    const cipher = new Uint8Array(buf, 12);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, cipher);
}

// ─── API helpers ─────────────────────────────────────────────────────────────

async function getAuthHeader() {
    // Auth token is injected by the auth module — access via global if available.
    const { auth } = await import('../firebase/config');
    const token = await auth?.currentUser?.getIdToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadEncryptedBlob({ roomId, fileName, mimeType, fileSize, encryptedBlob, onProgress }) {
    const authHeaders = await getAuthHeader();
    const params = new URLSearchParams({ roomId, fileName, mimeType, fileSize: String(fileSize) });

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/storage/upload?${params}`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        const authToken = authHeaders.Authorization;
        if (authToken) xhr.setRequestHeader('Authorization', authToken);

        if (typeof onProgress === 'function') {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText)); }
                catch { reject(new Error('Invalid server response.')); }
            } else {
                let msg = `Upload failed (${xhr.status})`;
                try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
                reject(new Error(msg));
            }
        };
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(encryptedBlob);
    });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Encrypt and upload a File to Firebase Storage.
 *
 * @param {File} file
 * @param {string} roomId
 * @param {{ onProgress?: (pct: number) => void }} [opts]
 * @returns {Promise<{ objectPath: string, mediaKey: string, mediaName: string, mediaMime: string, mediaSize: number }>}
 */
export async function encryptAndUploadFile(file, roomId, { onProgress } = {}) {
    if (!file || !(file instanceof File)) throw new Error('A File object is required.');
    if (!roomId) throw new Error('roomId is required.');

    const mediaMime = file.type || 'application/octet-stream';
    const mediaName = file.name || 'file';

    // 1. Generate per-file key
    const cryptoKey = await generateFileKey();
    const mediaKey = await exportKeyAsBase64(cryptoKey);

    // 2. Read + encrypt
    const rawBytes = await file.arrayBuffer();
    const encryptedBuf = await encryptBytes(cryptoKey, rawBytes);

    // 3. POST encrypted blob to server — no signed URLs, no CORS
    const safeFileName = `${Date.now()}-${mediaName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const encryptedBlob = new Blob([encryptedBuf], { type: 'application/octet-stream' });
    const { objectPath } = await uploadEncryptedBlob({
        roomId,
        fileName: safeFileName,
        mimeType: mediaMime,
        fileSize: file.size,
        encryptedBlob,
        onProgress
    });

    return {
        objectPath,
        mediaKey,
        mediaName,
        mediaMime,
        mediaSize: file.size
    };
}

/**
 * Fetch + decrypt a media file stored in Firebase Storage.
 *
 * @param {string} downloadUrl  — signed or public Firebase Storage URL
 * @param {string} mediaKey     — base64-encoded AES-GCM key stored with the message
 * @param {string} [mediaMime]  — MIME type for the resulting object URL
 * @returns {Promise<string>}   — object URL (revoke with URL.revokeObjectURL when done)
 */
export async function fetchAndDecryptMedia(downloadUrl, mediaKey, mediaMime = 'application/octet-stream') {
    if (!downloadUrl || !mediaKey) throw new Error('downloadUrl and mediaKey are required.');

    const cryptoKey = await importKeyFromBase64(mediaKey);
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);

    const encryptedBuf = await res.arrayBuffer();
    const decryptedBuf = await decryptBytes(cryptoKey, encryptedBuf);
    const blob = new Blob([decryptedBuf], { type: mediaMime });
    return URL.createObjectURL(blob);
}

/**
 * Generate a Supabase Storage public download URL from an object path.
 * The bucket must have public read enabled (files are encrypted so this is safe).
 */
export function buildStorageDownloadUrl(objectPath) {
    const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
    const bucket = String(import.meta.env.PUBLIC_SUPABASE_STORAGE_BUCKET || 'media').trim();
    if (!supabaseUrl || !objectPath) return null;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
}
