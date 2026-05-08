import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import RootApp from './app/router/RootApp';
import AppErrorBoundary from './shared/components/layout/AppErrorBoundary';
import './index.css';
import { persistor, store } from './app/store/store';
import { BRAND, BRAND_ASSETS } from './shared/config/branding';
import { BRAND_SW_CACHE_PREFIX, BRAND_SYNC_TAG } from './config/brandTokens';
import { initializePushNotifications } from './services/firebase/pushNotifications';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const DARK_FAVICON = BRAND_ASSETS.faviconDark;
const LIGHT_FAVICON = BRAND_ASSETS.faviconLight;
const DARK_THEME_COLOR = '#0f172a';
const LIGHT_THEME_COLOR = '#f8fafc';

const showAppUpdateToast = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const existingToast = document.getElementById('app-update-toast');
    if (existingToast) {
        return;
    }

    const toast = document.createElement('div');
    toast.id = 'app-update-toast';
    toast.textContent = 'App updated, reloading...';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    Object.assign(toast.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        zIndex: '9999',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.4)',
        background: 'rgba(15,23,42,0.92)',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: '0.8rem',
        letterSpacing: '0.01em',
        boxShadow: '0 16px 34px rgba(2,6,23,0.35)',
        opacity: '0',
        transition: 'opacity 180ms ease'
    });

    document.body.appendChild(toast);
    window.requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });
};

const showInstallPrompt = (deferredPrompt) => {
    if (typeof document === 'undefined' || !deferredPrompt) {
        return;
    }

    const existingBanner = document.getElementById('app-install-banner');
    if (existingBanner) {
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'app-install-banner';
    Object.assign(banner.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.45)',
        background: 'rgba(15,23,42,0.95)',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: '0.78rem',
        boxShadow: '0 16px 34px rgba(2,6,23,0.35)',
        whiteSpace: 'nowrap'
    });
    const label = document.createElement('span');
    label.textContent = `Add ${BRAND.name} to home screen`;

    const installButton = document.createElement('button');
    installButton.type = 'button';
    installButton.textContent = 'Install';
    Object.assign(installButton.style, {
        borderRadius: '999px',
        border: '1px solid rgba(16,185,129,0.45)',
        background: 'rgba(16,185,129,0.25)',
        color: '#d1fae5',
        padding: '4px 10px',
        cursor: 'pointer'
    });

    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.textContent = 'Later';
    Object.assign(dismissButton.style, {
        borderRadius: '999px',
        border: '1px solid rgba(148,163,184,0.4)',
        background: 'transparent',
        color: '#cbd5e1',
        padding: '4px 10px',
        cursor: 'pointer'
    });

    installButton.addEventListener('click', async () => {
        banner.remove();
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => {
            // Ignore user cancellation.
        });
    });

    dismissButton.addEventListener('click', () => {
        banner.remove();
    });

    banner.appendChild(label);
    banner.appendChild(installButton);
    banner.appendChild(dismissButton);
    document.body.appendChild(banner);
};

const tryRegisterBackgroundSync = (registration) => {
    if (!registration?.sync || typeof registration.sync.register !== 'function') {
        return;
    }

    registration.sync.register(BRAND_SYNC_TAG).catch(() => {
        // Not supported on all browsers or blocked by user settings.
    });
};

const PersistLoading = () => (
    <>
        <style>{`
            @keyframes bs-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.9);opacity:0.65} }
            @keyframes bs-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            @keyframes bs-bar { 0%{width:0%} 60%{width:72%} 100%{width:100%} }
            @keyframes bs-shimmer { 0%,100%{opacity:0.45} 50%{opacity:1} }
        `}</style>
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 30%, #0d2232 0%, #0f172a 55%, #060e18 100%)',
            fontFamily: "'Inter','Segoe UI',sans-serif"
        }}>
            <div style={{ textAlign: 'center', animation: 'bs-fadein 0.55s cubic-bezier(0.22,1,0.36,1) both' }}>
                <img
                    src={BRAND_ASSETS.logoDark}
                    alt={BRAND.name}
                    width={80}
                    height={80}
                    style={{
                        borderRadius: 20,
                        boxShadow: '0 0 0 1px rgba(0,240,255,0.18), 0 0 52px rgba(0,240,255,0.22)',
                        animation: 'bs-pulse 2.2s ease-in-out infinite',
                        display: 'block',
                        margin: '0 auto 22px'
                    }}
                />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: '#e2e8f0', letterSpacing: '-0.015em' }}>
                    {BRAND.name}
                </p>
                <p style={{ margin: '5px 0 0', fontSize: '0.7rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', animation: 'bs-shimmer 2s ease-in-out infinite' }}>
                    {BRAND.tagline}
                </p>
                <div style={{ marginTop: 28, width: 120, height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', margin: '28px auto 0' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#00f0ff,#a855f7)', animation: 'bs-bar 1.8s cubic-bezier(0.4,0,0.2,1) both' }} />
                </div>
            </div>
        </div>
    </>
);

const syncFaviconWithTheme = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const isDark = htmlTheme === 'dark';
    const baseHref = isDark ? DARK_FAVICON : LIGHT_FAVICON;
    const nextHref = `${baseHref}?v=${encodeURIComponent(APP_VERSION)}&t=${isDark ? 'dark' : 'light'}`;
    const existing = document.getElementById('app-favicon');
    const shortcut = document.getElementById('app-favicon-shortcut');

    if (existing) {
        existing.setAttribute('href', nextHref);
    } else {
        const link = document.createElement('link');
        link.id = 'app-favicon';
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = nextHref;
        document.head.appendChild(link);
    }

    if (shortcut) {
        shortcut.setAttribute('href', nextHref);
    } else {
        const shortcutLink = document.createElement('link');
        shortcutLink.id = 'app-favicon-shortcut';
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/x-icon';
        shortcutLink.href = nextHref;
        document.head.appendChild(shortcutLink);
    }
};

const syncThemeColorWithTheme = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const isDark = htmlTheme === 'dark';
    const nextColor = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
    const existing = document.querySelector('meta[name="theme-color"]');

    if (existing) {
        existing.setAttribute('content', nextColor);
        return;
    }

    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', nextColor);
    document.head.appendChild(meta);
};

const cleanupLegacyFaviconLinks = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const managedIds = new Set(['app-favicon', 'app-favicon-shortcut']);
    const candidates = document.head.querySelectorAll('link[rel]');

    candidates.forEach((link) => {
        const relTokens = link
            .getAttribute('rel')
            ?.toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        if (!relTokens || !relTokens.includes('icon')) {
            return;
        }

        if (managedIds.has(link.id)) {
            return;
        }

        link.remove();
    });
};

if (typeof document !== 'undefined') {
    cleanupLegacyFaviconLinks();
    syncFaviconWithTheme();
    syncThemeColorWithTheme();

    const observer = new MutationObserver(() => {
        syncFaviconWithTheme();
        syncThemeColorWithTheme();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    let deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        showInstallPrompt(deferredInstallPrompt);
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js?v=${encodeURIComponent(APP_VERSION)}&cp=${encodeURIComponent(BRAND_SW_CACHE_PREFIX)}`, {
                scope: import.meta.env.BASE_URL
            })
            .then((registration) => {
                registration.update().catch(() => {
                    // Ignore update check failures.
                });

                tryRegisterBackgroundSync(registration);
                window.addEventListener('online', () => tryRegisterBackgroundSync(registration));

                initializePushNotifications(registration).catch(() => {
                    // Notifications are optional; silently ignore setup failures.
                });

                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) {
                        return;
                    }

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                let hasRefreshed = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (hasRefreshed) {
                        return;
                    }

                    hasRefreshed = true;
                    showAppUpdateToast();
                    window.setTimeout(() => {
                        window.location.reload();
                    }, 900);
                });
            })
            .catch((error) => {
                console.error('Service worker registration failed:', error);
            });
    });
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
            registration.unregister().catch(() => {
                // Ignore cleanup failures in development.
            });
        });
    });
}

import { ToastProvider } from './shared/components/UI/Toast.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppErrorBoundary>
            <Provider store={store}>
                <PersistGate loading={<PersistLoading />} persistor={persistor}>
                    <ToastProvider>
                        <RootApp />
                    </ToastProvider>
                </PersistGate>
            </Provider>
        </AppErrorBoundary>
    </React.StrictMode>
);
