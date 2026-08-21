'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useSyncExternalStore, useRef } from 'react';

// Types
export type UnitSystem = 'metric' | 'imperial';
export type Language = 'ro' | 'en';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface UserPreferences {
    // Display
    unitSystem: UnitSystem;
    language: Language;
    dateFormat: DateFormat;
    // Behavior
    autoSaveInterval: number; // seconds, 0 = disabled
    showWelcomeOnStartup: boolean;
    compactMode: boolean;
    // Notifications
    showSyncNotifications: boolean;
    showOfflineWarning: boolean;
    // Defaults
    defaultCategory: string;
    defaultPipeMaterial: string;
}

const defaultPreferences: UserPreferences = {
    unitSystem: 'metric',
    language: 'ro',
    dateFormat: 'DD/MM/YYYY',
    autoSaveInterval: 30,
    showWelcomeOnStartup: true,
    compactMode: false,
    showSyncNotifications: true,
    showOfflineWarning: true,
    defaultCategory: 'Pipes',
    defaultPipeMaterial: 'carbon_steel',
};

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

interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
    resetPreferences: () => void;
    isOnline: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'datacenter_user_preferences';

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    // SSR-safe hydration: render defaults first, read localStorage only after mount
    // to avoid hydration mismatches (provider lives in the root layout and is server-rendered).
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isInitialized, setIsInitialized] = useState(false);
    const skipNextSaveRef = useRef(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted-gate pattern (SSR-safe)
                    setPreferences({ ...defaultPreferences, ...parsed });
                }
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted-gate pattern (SSR-safe)
        setIsInitialized(true);
    }, []);

    // Use useSyncExternalStore for SSR-safe online status
    const isOnline = useSyncExternalStore(
        subscribeOnlineStatus,
        getOnlineSnapshot,
        getServerSnapshot
    );

    // Save preferences to localStorage when changed (after hydration only)
    useEffect(() => {
        if (!isInitialized) return;
        if (skipNextSaveRef.current) {
            skipNextSaveRef.current = false;
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    }, [preferences, isInitialized]);

    const updatePreference = useCallback(<K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetPreferences = useCallback(() => {
        // Bypass the next save effect so defaults are not immediately re-written to storage
        skipNextSaveRef.current = true;
        setPreferences(defaultPreferences);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Failed to reset preferences:', e);
        }
        // Safety net: clear the flag even if no state update fires the save effect
        setTimeout(() => {
            skipNextSaveRef.current = false;
        }, 0);
    }, []);

    const value = React.useMemo(() => ({
        preferences,
        updatePreference,
        resetPreferences,
        isOnline
    }), [preferences, updatePreference, resetPreferences, isOnline]);

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

// Utility hooks
export const useIsOnline = () => {
    const { isOnline } = usePreferences();
    return isOnline;
};

// Unit conversion utilities
export const useUnitConversion = () => {
    const { preferences } = usePreferences();
    const isMetric = preferences.unitSystem === 'metric';

    return React.useMemo(() => ({
        // Length
        toDisplayLength: (meters: number) => isMetric ? meters : meters * 3.28084,
        fromDisplayLength: (value: number) => isMetric ? value : value / 3.28084,
        lengthUnit: isMetric ? 'm' : 'ft',

        // Weight
        toDisplayWeight: (kg: number) => isMetric ? kg : kg * 2.20462,
        fromDisplayWeight: (value: number) => isMetric ? value : value / 2.20462,
        weightUnit: isMetric ? 'kg' : 'lb',

        // Volume
        toDisplayVolume: (liters: number) => isMetric ? liters : liters * 0.264172,
        fromDisplayVolume: (value: number) => isMetric ? value : value / 0.264172,
        volumeUnit: isMetric ? 'L' : 'gal',

        // Temperature
        toDisplayTemp: (celsius: number) => isMetric ? celsius : (celsius * 9 / 5) + 32,
        fromDisplayTemp: (value: number) => isMetric ? value : (value - 32) * 5 / 9,
        tempUnit: isMetric ? '°C' : '°F',

        // Pressure
        toDisplayPressure: (bar: number) => isMetric ? bar : bar * 14.5038,
        fromDisplayPressure: (value: number) => isMetric ? value : value / 14.5038,
        pressureUnit: isMetric ? 'bar' : 'psi',
    }), [isMetric]);
};

// Import translations
import { translations } from '@/lib/translations';

export const useTranslation = () => {
    const { preferences } = usePreferences();

    const t = useCallback((key: string): string => {
        const lang = preferences.language;

        // Helper to traverse object path
        const resolve = (obj: Record<string, unknown> | undefined, path: string): string | undefined => {
            if (!obj) return undefined;
            if (!path.includes('.')) {
                const val = obj[path];
                return typeof val === 'string' ? val : undefined;
            }

            const parts = path.split('.');
            let current: unknown = obj;
            for (const part of parts) {
                if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
                    current = (current as Record<string, unknown>)[part];
                } else {
                    return undefined;
                }
            }
            return typeof current === 'string' ? current : undefined;
        };

        // 1. Try selected language
        let result = resolve(translations[lang as keyof typeof translations] as Record<string, unknown> | undefined, key);

        // 2. Fallback: Try root level (fixes structural issues where keys leaked to root)
        if (!result) {
            result = resolve(translations as unknown as Record<string, unknown>, key);
        }

        // 3. Last resort: Try 'ro' explicitly if not already checked
        if (!result && lang !== 'ro') {
            result = resolve(translations['ro' as keyof typeof translations] as Record<string, unknown> | undefined, key);
        }

        // 4. Ultimate fallback: Check common keys at root if common.x
        if (!result && key.startsWith('common.')) {
            const commonObj = (translations as unknown as Record<string, unknown>)['common'];
            result = resolve(commonObj as Record<string, unknown> | undefined, key.replace('common.', ''));
        }

        return result || key;
    }, [preferences.language]);

    return { t, language: preferences.language };
};
