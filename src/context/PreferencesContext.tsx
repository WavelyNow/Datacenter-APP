'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
    resetPreferences: () => void;
    isOnline: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'datacenter_user_preferences';

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [isOnline, setIsOnline] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPreferences({ ...defaultPreferences, ...parsed });
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save preferences to localStorage when changed
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
            } catch (e) {
                console.warn('Failed to save preferences:', e);
            }
        }
    }, [preferences, isLoaded]);

    // Online/Offline detection
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updatePreference = useCallback(<K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetPreferences = useCallback(() => {
        setPreferences(defaultPreferences);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences, isOnline }}>
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

    return {
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
    };
};

// Import translations
import { translations } from '@/lib/translations';

export const useTranslation = () => {
    const { preferences } = usePreferences();

    const t = useCallback((key: string): string => {
        const lang = preferences.language;
        const dict = translations[lang];

        // Handle dots (nested keys)
        if (key.includes('.')) {
            const parts = key.split('.');
            let current: any = dict;

            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    return key; // Path not found
                }
            }

            // Only return if it's a string, otherwise return key to avoid React object errors
            return typeof current === 'string' ? current : key;
        }

        // Fallback to common if no dot
        // @ts-ignore
        return dict.common?.[key] || key;
    }, [preferences.language]);

    return { t, language: preferences.language };
};
