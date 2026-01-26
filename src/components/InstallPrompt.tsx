'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { useTranslation } from '@/context/PreferencesContext';

export function InstallPrompt() {
    const { isInstallable, isInstalled, installApp, dismissInstallPrompt } = usePWA();
    const { t } = useTranslation();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user previously dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // Delay showing install banner for better UX
        if (isInstallable && !isInstalled) {
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable, isInstalled]);

    const handleInstall = async () => {
        const success = await installApp();
        if (success) {
            setShowBanner(false);
        }
    };

    const handleDismiss = () => {
        dismissInstallPrompt();
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                    <Download className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                                        {t('pwa.installTitle')}
                                    </h3>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                                        {t('pwa.installDescription')}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="flex-shrink-0 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-stone-400" />
                                </button>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                                >
                                    {t('pwa.notNow')}
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all shadow-lg shadow-emerald-500/25"
                                >
                                    {t('pwa.install')}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
