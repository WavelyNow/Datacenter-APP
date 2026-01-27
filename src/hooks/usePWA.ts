'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
    const [isInstallable, setIsInstallable] = useState(false);
    // Use lazy initial state to avoid setState in useEffect
    const [isInstalled, setIsInstalled] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
    );
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator !== 'undefined' ? navigator.onLine : true
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
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        // Online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const installApp = useCallback(async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
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
