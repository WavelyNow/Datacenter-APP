'use client';

import React from 'react';
import { usePreferences, useTranslation, UnitSystem, DateFormat } from '@/context/PreferencesContext';
import {
    Settings,
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
    <div className="card-premium mb-4 min-w-0 rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="shrink-0 rounded-xl bg-muted p-2 text-primary">
                {icon}
            </div>
            <div className="min-w-0">
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
    <div className="flex flex-col gap-3 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
        <div className="w-full max-w-full sm:ml-6 sm:w-auto">
            {children}
        </div>
    </div>
);

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        className={`relative ml-auto block h-6 w-11 rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${checked ? 'bg-primary' : 'bg-muted'
            }`}
    >
        <motion.div
            animate={{ x: checked ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 h-4 w-4 rounded-full bg-background shadow-sm"
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
        <div className="flex w-full max-w-full flex-wrap overflow-hidden rounded-xl border border-border sm:w-auto sm:flex-nowrap">
            {options.map((opt, i) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`flex min-w-0 basis-1/2 items-center justify-center gap-2 px-2 py-2 text-center text-xs font-medium transition-colors sm:basis-auto sm:px-3 sm:py-1.5 ${value === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-background'
                        } ${i % 2 === 1 ? 'border-l border-border' : ''} ${i > 0 ? 'sm:border-l sm:border-border' : ''} ${i > 1 ? 'border-t border-border sm:border-t-0' : ''}`}
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
            <div className="glass-panel z-10 shrink-0 border-x-0 border-t-0 px-4 py-4 sm:px-8 sm:py-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
                        <span>{t('settingsPage.system')}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">{t('commandPalette.cmds.projectSettings.title')}</span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="mb-2 flex flex-wrap items-center gap-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                <Settings className="h-8 w-8 shrink-0 text-primary" />
                                {t('settingsPage.title')}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-medium">
                                {t('settingsPage.subtitle')}
                            </p>
                        </div>

                        <button
                            onClick={resetPreferences}
                            type="button"
                            className="btn btn-secondary btn-md w-full justify-center gap-2 whitespace-nowrap sm:w-auto"
                        >
                            <RotateCcw className="w-4 h-4" /> {t('settingsPage.resetDefaults')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8">
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
                                ariaLabel="Mod compact"
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
                                ariaLabel="Mesaj de bun venit la deschidere"
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
                                ariaLabel="Notificări la sincronizare"
                            />
                        </SettingRow>

                        <SettingRow
                            label={t('settingsPage.rows.offlineWarning.label')}
                            description={t('settingsPage.rows.offlineWarning.description')}
                        >
                            <ToggleSwitch
                                checked={preferences.showOfflineWarning}
                                onChange={v => updatePreference('showOfflineWarning', v)}
                                ariaLabel="Avertisment la deconectare"
                            />
                        </SettingRow>
                    </SettingsSection>

                    {/* Current Settings Summary */}
                    <div className="card-premium mt-6 rounded-xl p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <Check className="w-3 h-3" /> {t('settingsPage.currentSettings')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-xl border border-border bg-muted px-2 py-1 text-xs text-foreground">
                                {preferences.unitSystem === 'metric' ? `🌍 ${t('settingsPage.options.metric')}` : `🇺🇸 ${t('settingsPage.options.imperial')}`}
                            </span>
                            <span className="rounded-xl border border-border bg-muted px-2 py-1 text-xs text-foreground">
                                📅 {preferences.dateFormat}
                            </span>
                            <span className="rounded-xl border border-border bg-muted px-2 py-1 text-xs text-foreground">
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
