import CryptoJS from 'crypto-js';

export function encryptMessage(text, secret) {
    const safeText = String(text || '');
    const safeSecret = String(secret || '');

    if (!safeSecret) {
        throw new Error('Encryption secret is required.');
    }

    if (!safeText) {
        throw new Error('Cannot encrypt empty message.');
    }

    return CryptoJS.AES.encrypt(safeText, safeSecret).toString();
}

export function decryptMessage(cipher, secret) {
    const safeCipher = String(cipher || '');
    const safeSecret = String(secret || '');

    if (!safeSecret) {
        throw new Error('Decryption secret is required.');
    }

    if (!safeCipher) {
        return '';
    }

    const bytes = CryptoJS.AES.decrypt(safeCipher, safeSecret);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error('Unable to decrypt message. Check password.');
    }

    return decrypted;
}
