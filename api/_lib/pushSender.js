/**
 * pushSender.js — unified push notification sender
 *
 * Supports:
 *   • Firebase Cloud Messaging (FCM) for Chrome/Android
 *   • Native Web Push (VAPID) for Edge, Firefox, Safari, and all browsers
 *
 * Required env vars (VAPID — generate once with `npx web-push generate-vapid-keys`):
 *   VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT  (e.g. "mailto:admin@yourdomain.com")
 */

import webpush from 'web-push';

let vapidConfigured = false;

function ensureVapid() {
    if (vapidConfigured) return true;

    const publicKey = String(process.env.VAPID_PUBLIC_KEY || '').trim();
    const privateKey = String(process.env.VAPID_PRIVATE_KEY || '').trim();
    const subject = String(process.env.VAPID_SUBJECT || process.env.PUBLIC_APP_URL || 'mailto:admin@beyondstrings.app').trim();

    if (!publicKey || !privateKey) return false;

    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
    return true;
}

/**
 * Detect whether a stored device_token is a native Web Push subscription JSON
 * vs. an FCM registration token string.
 */
function parseDeviceToken(deviceToken) {
    const raw = String(deviceToken || '').trim();
    if (raw.startsWith('{')) {
        try {
            const sub = JSON.parse(raw);
            if (sub.endpoint) return { type: 'native', sub };
        } catch {
            // Not valid JSON — treat as FCM token.
        }
    }
    return { type: 'fcm', token: raw };
}

/**
 * Send a push notification to a single device token.
 *
 * @param {string} deviceToken  — value from notification_devices.device_token
 * @param {{ title: string, body: string, url?: string, tag?: string, icon?: string }} notification
 * @param {object} [adminApp]   — firebase-admin app instance (for FCM sends)
 * @returns {Promise<{ ok: boolean, method: string, error?: string }>}
 */
export async function sendPushToDevice(deviceToken, notification, adminApp) {
    const { type, token, sub } = parseDeviceToken(deviceToken);

    if (type === 'native') {
        if (!ensureVapid()) {
            return { ok: false, method: 'native', error: 'VAPID keys not configured' };
        }

        const payload = JSON.stringify({
            title: String(notification.title || 'BeyondStrings'),
            body: String(notification.body || ''),
            url: String(notification.url || '/'),
            tag: String(notification.tag || 'beyondstrings-push'),
            icon: notification.icon || null
        });

        try {
            await webpush.sendNotification(sub, payload, {
                TTL: 86400 // 24 hours
            });
            return { ok: true, method: 'native' };
        } catch (err) {
            return { ok: false, method: 'native', error: err.message, statusCode: err.statusCode };
        }
    }

    // FCM token
    if (!adminApp) {
        return { ok: false, method: 'fcm', error: 'adminApp required for FCM sends' };
    }

    try {
        const { getMessaging } = await import('firebase-admin/messaging');
        const messaging = getMessaging(adminApp);

        await messaging.send({
            token,
            notification: {
                title: String(notification.title || 'BeyondStrings'),
                body: String(notification.body || '')
            },
            webpush: {
                notification: {
                    title: String(notification.title || 'BeyondStrings'),
                    body: String(notification.body || ''),
                    icon: notification.icon || undefined,
                    tag: notification.tag || 'beyondstrings-push',
                    requireInteraction: false
                },
                fcmOptions: {
                    link: notification.url || '/'
                }
            }
        });

        return { ok: true, method: 'fcm' };
    } catch (err) {
        return { ok: false, method: 'fcm', error: err.message };
    }
}

/**
 * Send a push notification to all active devices for a user.
 *
 * @param {import('neon-serverless').NeonQueryFunction} sql
 * @param {string} firebaseUid
 * @param {{ title: string, body: string, url?: string, tag?: string }} notification
 * @param {object} [adminApp]
 */
export async function sendPushToUser(sql, firebaseUid, notification, adminApp) {
    const devices = await sql`
        SELECT device_token, platform
        FROM notification_devices
        WHERE firebase_uid = ${firebaseUid}
          AND is_active = true
        ORDER BY last_seen_at DESC
        LIMIT 10
    `;

    if (!devices.length) return { sent: 0, failed: 0 };

    const results = await Promise.allSettled(
        devices.map((d) => sendPushToDevice(d.device_token, notification, adminApp))
    );

    let sent = 0;
    let failed = 0;
    const staleTokens = [];

    results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value?.ok) {
            sent++;
        } else {
            failed++;
            // 410 Gone = subscription expired/unsubscribed; deactivate it.
            const statusCode = result.value?.statusCode;
            if (statusCode === 410 || statusCode === 404) {
                staleTokens.push(devices[i].device_token);
            }
        }
    });

    // Deactivate expired subscriptions.
    if (staleTokens.length) {
        await sql`
            UPDATE notification_devices
            SET is_active = false, updated_at = NOW()
            WHERE device_token = ANY(${staleTokens})
        `.catch(() => { });
    }

    return { sent, failed };
}
