'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// SSR-safe subscription to online status
function subscribeOnlineStatus(callback: () => void) {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}

function getOnlineSnapshot() {
    return navigator.onLine;
}

function getOnlineServerSnapshot() {
    return true;
}

// SSR-safe subscription to display mode
function subscribeDisplayMode(callback: () => void) {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
}

function getDisplayModeSnapshot() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

function getDisplayModeServerSnapshot() {
    return false;
}

export function usePWA() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    // Use useSyncExternalStore for SSR-safe online status
    const isOnline = useSyncExternalStore(
        subscribeOnlineStatus,
        getOnlineSnapshot,
        getOnlineServerSnapshot
    );

    // Use useSyncExternalStore for SSR-safe display mode detection
    const isInstalled = useSyncExternalStore(
        subscribeDisplayMode,
        getDisplayModeSnapshot,
        getDisplayModeServerSnapshot
    );

    useEffect(() => {
        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstallable(false);
            }

            setDeferredPrompt(null);
            return outcome === 'accepted';
        } catch (error) {
            console.error('Install prompt error:', error);
            return false;
        }
    }, [deferredPrompt]);

    const dismissInstallPrompt = useCallback(() => {
        setIsInstallable(false);
        // Store in localStorage so we don't show again this session
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }, []);

    return {
        isInstallable,
        isInstalled,
        isOnline,
        installApp,
        dismissInstallPrompt,
    };
}
