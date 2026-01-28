'use client';

import React, { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// SSR-safe subscription to online status using useSyncExternalStore
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

function getServerSnapshot() {
    return true; // Assume online on server
}

export const OnlineStatusIndicator: React.FC = () => {
    // Use useSyncExternalStore for SSR-safe online status
    const isOnline = useSyncExternalStore(
        subscribeOnlineStatus,
        getOnlineSnapshot,
        getServerSnapshot
    );

    // Simple: show banner only when offline
    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 bg-amber-500 text-white"
                >
                    <WifiOff className="w-4 h-4" />
                    You&apos;re offline. Changes will be saved locally.
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Small inline indicator for use in header/sidebar
export const OnlineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
    // Use useSyncExternalStore for SSR-safe online status
    const isOnline = useSyncExternalStore(
        subscribeOnlineStatus,
        getOnlineSnapshot,
        getServerSnapshot
    );

    return (
        <div
            className={`flex items-center gap-1.5 text-xs font-medium ${className}`}
            title={isOnline ? 'Connected' : 'Offline - changes saved locally'}
        >
            <span
                className={`w-2 h-2 rounded-full ${isOnline
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                    }`}
            />
            <span className={isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};
