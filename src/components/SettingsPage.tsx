'use client';

import React from 'react';
import { usePreferences, UnitSystem, Language, DateFormat } from '@/context/PreferencesContext';
import {
    Settings,
    Globe,
    Ruler,
    Calendar,
    Bell,
    Monitor,
    RotateCcw,
    ChevronRight,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsSectionProps {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon, children }) => (
    <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface SettingRowProps {
    label: string;
    description?: string;
    children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
        <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
        <div className="flex-shrink-0 ml-4">
            {children}
        </div>
    </div>
);

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'
            }`}
    >
        <motion.div
            animate={{ x: checked ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
    </button>
);

interface SelectOption<T> {
    value: T;
    label: string;
    icon?: React.ReactNode;
}

interface SelectButtonGroupProps<T extends string> {
    options: SelectOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

function SelectButtonGroup<T extends string>({ options, value, onChange }: SelectButtonGroupProps<T>) {
    return (
        <div className="flex rounded-lg border border-border overflow-hidden">
            {options.map((opt, i) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${value === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                        } ${i > 0 ? 'border-l border-border' : ''}`}
                >
                    {opt.icon}
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export const SettingsPage: React.FC = () => {
    const { preferences, updatePreference, resetPreferences } = usePreferences();

    const unitOptions: SelectOption<UnitSystem>[] = [
        { value: 'metric', label: 'Metric', icon: <span>🌍</span> },
        { value: 'imperial', label: 'Imperial', icon: <span>🇺🇸</span> }
    ];

    const languageOptions: SelectOption<Language>[] = [
        { value: 'ro', label: 'Română', icon: <span>🇷🇴</span> },
        { value: 'en', label: 'English', icon: <span>🇬🇧</span> }
    ];

    const dateFormatOptions: SelectOption<DateFormat>[] = [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
    ];

    const autoSaveOptions: SelectOption<string>[] = [
        { value: '0', label: 'Off' },
        { value: '30', label: '30s' },
        { value: '60', label: '1min' },
        { value: '300', label: '5min' }
    ];

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background/50 relative overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>System</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">Settings</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 flex items-center gap-3">
                                <Settings className="w-8 h-8 text-primary" />
                                User Preferences
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                Customize your experience with units, language, and display options.
                            </p>
                        </div>

                        <button
                            onClick={resetPreferences}
                            className="btn btn-secondary gap-2 h-10"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset to Defaults
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 min-h-0">
                <div className="max-w-3xl mx-auto">
                    {/* Display Settings */}
                    <SettingsSection
                        title="Display"
                        description="Customize how information is displayed"
                        icon={<Monitor className="w-5 h-5" />}
                    >
                        <SettingRow
                            label="Unit System"
                            description="Choose between metric and imperial measurements"
                        >
                            <SelectButtonGroup
                                options={unitOptions}
                                value={preferences.unitSystem}
                                onChange={v => updatePreference('unitSystem', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Date Format"
                            description="How dates are displayed throughout the app"
                        >
                            <SelectButtonGroup
                                options={dateFormatOptions}
                                value={preferences.dateFormat}
                                onChange={v => updatePreference('dateFormat', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Compact Mode"
                            description="Reduce spacing for more content on screen"
                        >
                            <ToggleSwitch
                                checked={preferences.compactMode}
                                onChange={v => updatePreference('compactMode', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Language Settings */}
                    <SettingsSection
                        title="Language"
                        description="Select your preferred language"
                        icon={<Globe className="w-5 h-5" />}
                    >
                        <SettingRow
                            label="Interface Language"
                            description="Language used for labels and messages"
                        >
                            <SelectButtonGroup
                                options={languageOptions}
                                value={preferences.language}
                                onChange={v => updatePreference('language', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Behavior Settings */}
                    <SettingsSection
                        title="Behavior"
                        description="Control app behavior and automation"
                        icon={<Ruler className="w-5 h-5" />}
                    >
                        <SettingRow
                            label="Auto-Save Interval"
                            description="Automatically save your work periodically"
                        >
                            <SelectButtonGroup
                                options={autoSaveOptions}
                                value={String(preferences.autoSaveInterval)}
                                onChange={v => updatePreference('autoSaveInterval', parseInt(v))}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Show Welcome on Startup"
                            description="Display welcome message when opening the app"
                        >
                            <ToggleSwitch
                                checked={preferences.showWelcomeOnStartup}
                                onChange={v => updatePreference('showWelcomeOnStartup', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Notification Settings */}
                    <SettingsSection
                        title="Notifications"
                        description="Manage alerts and notifications"
                        icon={<Bell className="w-5 h-5" />}
                    >
                        <SettingRow
                            label="Sync Notifications"
                            description="Show notifications when data is synced"
                        >
                            <ToggleSwitch
                                checked={preferences.showSyncNotifications}
                                onChange={v => updatePreference('showSyncNotifications', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label="Offline Warning"
                            description="Show banner when working offline"
                        >
                            <ToggleSwitch
                                checked={preferences.showOfflineWarning}
                                onChange={v => updatePreference('showOfflineWarning', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Current Settings Summary */}
                    <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <Check className="w-3 h-3" /> Current Settings Preview
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                {preferences.unitSystem === 'metric' ? '🌍 Metric' : '🇺🇸 Imperial'}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                {preferences.language === 'ro' ? '🇷🇴 Română' : '🇬🇧 English'}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                📅 {preferences.dateFormat}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                💾 Auto-save: {preferences.autoSaveInterval === 0 ? 'Off' : `${preferences.autoSaveInterval}s`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
