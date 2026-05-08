import { useCallback, useEffect, useState } from 'react';

/**
 * usePwaInstall
 *
 * Captures the browser's `beforeinstallprompt` event so the app can show a
 * custom "Install App" button instead of letting the browser call
 * `preventDefault()` silently and never prompt again.
 *
 * Usage:
 *   const { isInstallable, install } = usePwaInstall();
 *   {isInstallable && <button onClick={install}>Install app</button>}
 *
 * Notes:
 * - The hook calls `event.preventDefault()` on the deferred event to suppress
 *   the browser's default mini-info-bar while keeping the prompt available.
 * - After a successful or dismissed prompt the install button disappears.
 * - Works in Chrome / Edge / Samsung Internet on Android & desktop. Safari on
 *   iOS does not fire `beforeinstallprompt`; it shows its own Add-to-Home-Screen
 *   sheet, so `isInstallable` stays false there.
 */
export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Already running as a standalone PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Stop the browser from showing its own mini-info-bar
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstallable(false);
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) return;

        // Show the browser's native install prompt
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        // Whether the user accepted or dismissed, the prompt can't be reused
        setDeferredPrompt(null);

        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
    }, [deferredPrompt]);

    return { isInstallable, isInstalled, install };
}
