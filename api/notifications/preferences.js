import { authenticate } from '../_lib/rbac.js';
import { getSql } from '../_lib/db.js';

function asBool(value, fallback = true) {
    if (typeof value === 'boolean') return value;
    return fallback;
}

function normalizeToken(value) {
    return String(value || '').trim().slice(0, 4096);
}

async function handleRegisterToken(req, res, user, sql) {
    const body = req.body || {};
    const platform = String(body.platform || 'web').trim().slice(0, 40) || 'web';
    const userAgent = String(body.userAgent || req.headers['user-agent'] || '').slice(0, 512);
    const enabled = body.enabled !== false;

    // Native Web Push subscription (Edge, Firefox, Safari)
    if (body.webPushSubscription) {
        const sub = body.webPushSubscription;
        const endpoint = String(sub.endpoint || '').trim().slice(0, 4096);
        if (!endpoint) {
            return res.status(400).json({ error: 'webPushSubscription.endpoint is required.' });
        }

        // Serialize full subscription JSON as the device token for storage.
        const deviceToken = JSON.stringify({
            endpoint,
            keys: sub.keys || {},
            expirationTime: sub.expirationTime || null
        }).slice(0, 4096);

        await sql`
            INSERT INTO users (firebase_uid, email, role)
            VALUES (${user.uid}, ${user.email || ''}, ${user.role || 'user'})
            ON CONFLICT (firebase_uid)
            DO UPDATE SET updated_at = NOW()
        `;

        await sql`
            INSERT INTO notification_devices (firebase_uid, device_token, platform, user_agent, is_active, last_seen_at)
            VALUES (${user.uid}, ${deviceToken}, ${platform}, ${userAgent}, ${enabled}, NOW())
            ON CONFLICT (device_token)
            DO UPDATE SET
                firebase_uid = EXCLUDED.firebase_uid,
                platform = EXCLUDED.platform,
                user_agent = EXCLUDED.user_agent,
                is_active = EXCLUDED.is_active,
                last_seen_at = NOW(),
                updated_at = NOW()
        `;

        await sql`
            INSERT INTO notification_preferences (firebase_uid, push_enabled)
            VALUES (${user.uid}, ${enabled})
            ON CONFLICT (firebase_uid)
            DO UPDATE SET push_enabled = EXCLUDED.push_enabled, updated_at = NOW()
        `;

        return res.status(200).json({ ok: true, registered: true, method: 'native-vapid' });
    }

    // FCM token registration
    const deviceToken = normalizeToken(body.deviceToken || body.token);
    if (!deviceToken) {
        return res.status(400).json({ error: 'deviceToken or webPushSubscription is required.' });
    }

    await sql`
        INSERT INTO users (firebase_uid, email, role)
        VALUES (${user.uid}, ${user.email || ''}, ${user.role || 'user'})
        ON CONFLICT (firebase_uid)
        DO UPDATE SET updated_at = NOW()
    `;

    await sql`
        INSERT INTO notification_devices (firebase_uid, device_token, platform, user_agent, is_active, last_seen_at)
        VALUES (${user.uid}, ${deviceToken}, ${platform}, ${userAgent}, ${enabled}, NOW())
        ON CONFLICT (device_token)
        DO UPDATE SET
            firebase_uid = EXCLUDED.firebase_uid,
            platform = EXCLUDED.platform,
            user_agent = EXCLUDED.user_agent,
            is_active = EXCLUDED.is_active,
            last_seen_at = NOW(),
            updated_at = NOW()
    `;

    await sql`
        INSERT INTO notification_preferences (firebase_uid, push_enabled)
        VALUES (${user.uid}, ${enabled})
        ON CONFLICT (firebase_uid)
        DO UPDATE SET
            push_enabled = EXCLUDED.push_enabled,
            updated_at = NOW()
    `;

    return res.status(200).json({ ok: true, registered: true });
}

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user) return;

    try {
        const sql = getSql();

        // POST with deviceToken or webPushSubscription → device push-token registration.
        if (req.method === 'POST' && (req.body?.deviceToken || req.body?.token || req.body?.webPushSubscription)) {
            return handleRegisterToken(req, res, user, sql);
        }

        if (req.method === 'GET') {
            const rows = await sql`
                SELECT message_alerts, mention_alerts, insight_alerts, push_enabled
                FROM notification_preferences
                WHERE firebase_uid = ${user.uid}
                LIMIT 1
            `;

            const data = rows[0] || {
                message_alerts: true,
                mention_alerts: true,
                insight_alerts: true,
                push_enabled: true
            };

            return res.status(200).json({
                messageAlerts: Boolean(data.message_alerts),
                mentionAlerts: Boolean(data.mention_alerts),
                insightAlerts: Boolean(data.insight_alerts),
                pushEnabled: Boolean(data.push_enabled)
            });
        }

        if (req.method === 'POST') {
            const body = req.body || {};
            const messageAlerts = asBool(body.messageAlerts, true);
            const mentionAlerts = asBool(body.mentionAlerts, true);
            const insightAlerts = asBool(body.insightAlerts, true);
            const pushEnabled = asBool(body.pushEnabled, true);

            await sql`
                INSERT INTO notification_preferences (
                    firebase_uid,
                    message_alerts,
                    mention_alerts,
                    insight_alerts,
                    push_enabled
                ) VALUES (
                    ${user.uid},
                    ${messageAlerts},
                    ${mentionAlerts},
                    ${insightAlerts},
                    ${pushEnabled}
                )
                ON CONFLICT (firebase_uid)
                DO UPDATE SET
                    message_alerts = EXCLUDED.message_alerts,
                    mention_alerts = EXCLUDED.mention_alerts,
                    insight_alerts = EXCLUDED.insight_alerts,
                    push_enabled = EXCLUDED.push_enabled,
                    updated_at = NOW()
            `;

            // Keep devices in sync when push is globally disabled.
            if (!pushEnabled) {
                await sql`
                    UPDATE notification_devices
                    SET is_active = false, updated_at = NOW()
                    WHERE firebase_uid = ${user.uid}
                `;
            }

            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed.' });
    } catch (error) {
        console.error('[notifications/preferences]', error.message);
        return res.status(500).json({ error: 'Could not process notification preferences.' });
    }
}
