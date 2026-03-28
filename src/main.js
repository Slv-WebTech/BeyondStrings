import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';
import { persistor, store } from './store/store';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const APP_VERSION_STORAGE_KEY = 'convolens.app.version';

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

const PersistLoading = () => (
    <div
        style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            color: '#cbd5e1',
            background: 'linear-gradient(160deg, #081318 0%, #0f172a 100%)',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}
    >
        <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Loading ConvoLens...</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', opacity: 0.52, letterSpacing: '0.04em' }}>See Conversations Differently.</p>
        </div>
    </div>
);

const purgeCachesOnVersionChange = async () => {
    let previousVersion = null;

    try {
        previousVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY);
    } catch {
        return;
    }

    if (previousVersion === APP_VERSION) {
        return;
    }

    if ('caches' in window) {
        try {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        } catch (error) {
            console.warn('Cache purge on version update failed:', error);
        }
    }

    try {
        localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
    } catch {
        // Ignore storage failures and continue app startup.
    }
};

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        purgeCachesOnVersionChange()
            .then(() =>
                navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js?v=${encodeURIComponent(APP_VERSION)}`, {
                    scope: import.meta.env.BASE_URL
                })
            )
            .then((registration) => {
                registration.update().catch(() => {
                    // Ignore update check failures.
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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppErrorBoundary>
            <Provider store={store}>
                <PersistGate loading={<PersistLoading />} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </AppErrorBoundary>
    </React.StrictMode>
);
