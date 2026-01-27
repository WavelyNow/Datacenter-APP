'use client';

import React from 'react';
import { usePreferences, useTranslation, UnitSystem, Language, DateFormat } from '@/context/PreferencesContext';
import {
    Settings,
    Globe,
    Ruler,
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
    const { t } = useTranslation();

    const unitOptions: SelectOption<UnitSystem>[] = [
        { value: 'metric', label: t('settingsPage.options.metric'), icon: <span>🌍</span> },
        { value: 'imperial', label: t('settingsPage.options.imperial'), icon: <span>🇺🇸</span> }
    ];

    const languageOptions: SelectOption<Language>[] = [
        { value: 'ro', label: t('settingsPage.options.romanian'), icon: <span>🇷🇴</span> },
        { value: 'en', label: t('settingsPage.options.english'), icon: <span>🇬🇧</span> }
    ];

    const dateFormatOptions: SelectOption<DateFormat>[] = [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
    ];

    const autoSaveOptions: SelectOption<string>[] = [
        { value: '0', label: t('settingsPage.options.off') },
        { value: '30', label: `30${t('settingsPage.options.seconds')}` },
        { value: '60', label: `1${t('settingsPage.options.minutes')}` },
        { value: '300', label: `5${t('settingsPage.options.minutes')}` }
    ];

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background/50 relative overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-border/40 bg-background/80 backdrop-blur-md z-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>{t('settingsPage.system')}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t('commandPalette.cmds.projectSettings.title')}</span>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 flex items-center gap-3">
                                <Settings className="w-8 h-8 text-primary" />
                                {t('settingsPage.title')}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                {t('settingsPage.subtitle')}
                            </p>
                        </div>

                        <button
                            onClick={resetPreferences}
                            className="btn btn-secondary gap-2 h-10"
                        >
                            <RotateCcw className="w-4 h-4" /> {t('settingsPage.resetDefaults')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 min-h-0">
                <div className="max-w-3xl mx-auto">
                    {/* Display Settings */}
                    <SettingsSection
                        title={t('settingsPage.sections.display.title')}
                        description={t('settingsPage.sections.display.description')}
                        icon={<Monitor className="w-5 h-5" />}
                    >
                        <SettingRow
                            label={t('settingsPage.rows.unitSystem.label')}
                            description={t('settingsPage.rows.unitSystem.description')}
                        >
                            <SelectButtonGroup
                                options={unitOptions}
                                value={preferences.unitSystem}
                                onChange={v => updatePreference('unitSystem', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label={t('settingsPage.rows.dateFormat.label')}
                            description={t('settingsPage.rows.dateFormat.description')}
                        >
                            <SelectButtonGroup
                                options={dateFormatOptions}
                                value={preferences.dateFormat}
                                onChange={v => updatePreference('dateFormat', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label={t('settingsPage.rows.compactMode.label')}
                            description={t('settingsPage.rows.compactMode.description')}
                        >
                            <ToggleSwitch
                                checked={preferences.compactMode}
                                onChange={v => updatePreference('compactMode', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Language Settings */}
                    <SettingsSection
                        title={t('settingsPage.sections.language.title')}
                        description={t('settingsPage.sections.language.description')}
                        icon={<Globe className="w-5 h-5" />}
                    >
                        <SettingRow
                            label={t('settingsPage.rows.interfaceLanguage.label')}
                            description={t('settingsPage.rows.interfaceLanguage.description')}
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
                        title={t('settingsPage.sections.behavior.title')}
                        description={t('settingsPage.sections.behavior.description')}
                        icon={<Ruler className="w-5 h-5" />}
                    >
                        <SettingRow
                            label={t('settingsPage.rows.autoSaveInterval.label')}
                            description={t('settingsPage.rows.autoSaveInterval.description')}
                        >
                            <SelectButtonGroup
                                options={autoSaveOptions}
                                value={String(preferences.autoSaveInterval)}
                                onChange={v => updatePreference('autoSaveInterval', parseInt(v))}
                            />
                        </SettingRow>

                        <SettingRow
                            label={t('settingsPage.rows.showWelcome.label')}
                            description={t('settingsPage.rows.showWelcome.description')}
                        >
                            <ToggleSwitch
                                checked={preferences.showWelcomeOnStartup}
                                onChange={v => updatePreference('showWelcomeOnStartup', v)}
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Notification Settings */}
                    <SettingsSection
                        title={t('settingsPage.sections.notifications.title')}
                        description={t('settingsPage.sections.notifications.description')}
                        icon={<Bell className="w-5 h-5" />}
                    >
                        <SettingRow
                            label={t('settingsPage.rows.syncNotifications.label')}
                            description={t('settingsPage.rows.syncNotifications.description')}
                        >
                            <ToggleSwitch
                                checked={preferences.showSyncNotifications}
                                onChange={v => updatePreference('showSyncNotifications', v)}
                            />
                        </SettingRow>

                        <SettingRow
                            label={t('settingsPage.rows.offlineWarning.label')}
                            description={t('settingsPage.rows.offlineWarning.description')}
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
                            <Check className="w-3 h-3" /> {t('settingsPage.currentSettings')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                {preferences.unitSystem === 'metric' ? `🌍 ${t('settingsPage.options.metric')}` : `🇺🇸 ${t('settingsPage.options.imperial')}`}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                {preferences.language === 'ro' ? `🇷🇴 ${t('settingsPage.options.romanian')}` : `🇬🇧 ${t('settingsPage.options.english')}`}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                📅 {preferences.dateFormat}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-background border border-border text-xs">
                                💾 Auto-save: {preferences.autoSaveInterval === 0 ? t('settingsPage.options.off') : `${preferences.autoSaveInterval}s`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
