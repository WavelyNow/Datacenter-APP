'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OnlineStatusIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [showBanner, setShowBanner] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowBanner(true);
                setTimeout(() => setShowBanner(false), 3000);
            }
            setWasOffline(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowBanner(true);
        };

        // Initial state
        setIsOnline(navigator.onLine);
        if (!navigator.onLine) {
            setShowBanner(true);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className={`fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 ${isOnline
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                >
                    {isOnline ? (
                        <>
                            <Wifi className="w-4 h-4" />
                            Back online! Changes will sync automatically.
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            You&apos;re offline. Changes will be saved locally.
                        </>
                    )}
                    {isOnline && (
                        <button
                            onClick={() => setShowBanner(false)}
                            className="ml-4 text-white/80 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Small inline indicator for use in header/sidebar
export const OnlineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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
