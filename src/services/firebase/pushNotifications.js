import { firebaseApp, isFirebaseConfigured } from './config';
import { auth } from './config';
import { isSupported, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BRAND } from '../../config/branding';
import { BRAND_PUSH_MESSAGE_TAG } from '../../config/brandTokens';

const TOKEN_CACHE_KEY = 'beyondstrings:fcm-token:v1';
const NATIVE_SUB_CACHE_KEY = 'beyondstrings:web-push-sub:v1';
const PREFS_CACHE_KEY = 'beyondstrings:notification-prefs:v1';
const API_BASE = String(import.meta.env.PUBLIC_API_BASE_URL || '/api').replace(/\/$/, '');

function canUseNotifications() {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

function canUseNativePush() {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

async function ensurePermission() {
    if (!canUseNotifications()) {
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        return 'denied';
    }

    return Notification.requestPermission();
}

async function showForegroundNotification(payload = {}) {
    const cachedPrefs = JSON.parse(localStorage.getItem(PREFS_CACHE_KEY) || '{}');
    if (cachedPrefs?.pushEnabled === false) {
        return;
    }

    const title = String(payload?.notification?.title || payload?.data?.title || BRAND.name);
    const body = String(payload?.notification?.body || payload?.data?.body || 'You have a new update.');
    const notifPayload = {
        title,
        body,
        tag: String(payload?.data?.tag || BRAND_PUSH_MESSAGE_TAG),
        data: { url: String(payload?.data?.url || '/') }
    };

    // Prefer showing via service worker to avoid user-gesture restrictions (cross-browser).
    if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: notifPayload
        });
        return;
    }

    // Fallback: get the active SW registration and call showNotification directly.
    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration?.showNotification) {
            await registration.showNotification(title, {
                body: notifPayload.body,
                tag: notifPayload.tag,
                silent: false,
                data: notifPayload.data
            });
            return;
        }
    } catch {
        // Fall through to window.Notification fallback.
    }

    // Last resort: window.Notification (may be blocked in some browsers/contexts).
    if (Notification.permission === 'granted') {
        try {
            new Notification(title, { body });
        } catch {
            // Ignore if blocked.
        }
    }
}

async function getAuthHeader() {
    const token = await auth?.currentUser?.getIdToken?.();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

async function persistPushToken(token) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            ...(await getAuthHeader())
        };

        const response = await fetch(`${API_BASE}/notifications/preferences`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                deviceToken: token,
                platform: 'web',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
            })
        });

        return response.ok;
    } catch {
        return false;
    }
}

async function persistNativeSubscription(subscription) {
    try {
        const subJson = subscription.toJSON();
        const headers = {
            'Content-Type': 'application/json',
            ...(await getAuthHeader())
        };

        const response = await fetch(`${API_BASE}/notifications/preferences`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                webPushSubscription: subJson,
                platform: 'web-native',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
            })
        });

        if (response.ok) {
            localStorage.setItem(NATIVE_SUB_CACHE_KEY, JSON.stringify(subJson));
        }

        return response.ok;
    } catch {
        return false;
    }
}

/** Subscribe to native Web Push (VAPID) — works in Edge, Firefox, Safari, and Chrome. */
async function setupNativePush(serviceWorkerRegistration, vapidKey) {
    if (!canUseNativePush() || !vapidKey) {
        return { enabled: false, reason: 'native-push-unsupported' };
    }

    try {
        // Convert VAPID public key from base64url to Uint8Array.
        const urlBase64 = vapidKey.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (urlBase64.length % 4)) % 4);
        const base64 = (urlBase64 + padding);
        const rawKey = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const existing = await serviceWorkerRegistration.pushManager.getSubscription();
        let subscription = existing;

        if (!subscription) {
            subscription = await serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: rawKey
            });
        }

        const cachedSub = localStorage.getItem(NATIVE_SUB_CACHE_KEY);
        const subJson = JSON.stringify(subscription.toJSON());
        if (cachedSub !== subJson) {
            await persistNativeSubscription(subscription);
        }

        return { enabled: true, subscription };
    } catch {
        return { enabled: false, reason: 'native-push-subscribe-failed' };
    }
}

export function cacheNotificationPreferences(preferences = {}) {
    try {
        localStorage.setItem(PREFS_CACHE_KEY, JSON.stringify(preferences));
    } catch {
        // Ignore cache write errors.
    }
}

export async function initializePushNotifications(serviceWorkerRegistration) {
    if (!canUseNotifications()) {
        return { enabled: false, reason: 'notifications-unsupported' };
    }

    if (!serviceWorkerRegistration) {
        return { enabled: false, reason: 'missing-service-worker-registration' };
    }

    const permission = await ensurePermission();
    if (permission !== 'granted') {
        return { enabled: false, reason: `permission-${permission}` };
    }

    const vapidKey = String(import.meta.env.PUBLIC_FIREBASE_VAPID_KEY || '').trim();
    // Separate key pair for native Web Push (Edge, Firefox, Safari).
    // Falls back to the FCM key if PUBLIC_VAPID_KEY is not set.
    const nativeVapidKey = String(import.meta.env.PUBLIC_VAPID_KEY || vapidKey).trim();

    // Try Firebase Cloud Messaging first (works in Chrome + Chromium browsers with FCM).
    if (isFirebaseConfigured() && firebaseApp && vapidKey) {
        try {
            const fcmSupported = await isSupported();
            if (fcmSupported) {
                const messaging = getMessaging(firebaseApp);
                const token = await getToken(messaging, {
                    vapidKey,
                    serviceWorkerRegistration
                });

                if (token) {
                    const previousToken = localStorage.getItem(TOKEN_CACHE_KEY);
                    if (previousToken !== token) {
                        localStorage.setItem(TOKEN_CACHE_KEY, token);
                    }
                    await persistPushToken(token);

                    onMessage(messaging, (payload) => {
                        showForegroundNotification(payload);
                    });

                    return { enabled: true, token, method: 'fcm' };
                }
            }
        } catch {
            // FCM failed — fall through to native Web Push.
        }
    }

    // Fallback: native Web Push API (VAPID). Works in Edge, Firefox, Safari, and other browsers.
    if (nativeVapidKey) {
        const result = await setupNativePush(serviceWorkerRegistration, nativeVapidKey);
        if (result.enabled) {
            return { ...result, method: 'native-vapid' };
        }
    }

    return { enabled: false, reason: 'all-push-methods-failed' };
}
