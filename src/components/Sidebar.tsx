"use client";

import React from 'react';
import {
    Box,
    LayoutDashboard,
    Package,
    Scale,
    Camera,
    Anchor,
    Palette,
    Settings,
    HelpCircle,
    Save,
    Upload,
    Printer,
    Wrench,
    Cuboid,
    LucideIcon,
    ChevronLeft,
    ChevronRight,
    FileText,
    Sparkles,
    Ruler,
    Wand2,
    X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { OnlineStatusBadge } from './OnlineStatusIndicator';
import { useTranslation } from '@/context/PreferencesContext';
import { useProject } from '@/context/ProjectContext';
import { useUI } from '@/context/UIContext';
import { TabId } from '@/lib/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface MenuItem {
    id: TabId;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

interface NavSectionProps {
    items: MenuItem[];
    activeTab: TabId;
    onTabChange: (id: TabId) => void;
    isCollapsed: boolean;
}

const NavSection: React.FC<NavSectionProps> = ({ items, activeTab, onTabChange, isCollapsed }) => {
    return (
        <div className="space-y-1">
            {items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                    <button
                        type="button"
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-sm font-semibold ring-1 ring-primary/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <div className={`relative flex items-center justify-center transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-105'}`}>
                            <Icon className={`w-[18px] h-[18px] ${isActive ? 'stroke-2' : 'stroke-2'}`} />
                            {item.badge && isCollapsed && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <>
                                <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                    {item.label}
                                </span>
                                {item.badge && (
                                    <span className="ml-auto text-[9px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

interface SidebarProps {
    onSettingsOpen: () => void;
    onExportOpen: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const SidebarBase: React.FC<SidebarProps> = ({
    onSettingsOpen,
    onExportOpen,
    onSave,
    onLoad,
    isMobileOpen = false,
    onMobileClose
}) => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab: onTabChange } = useUI();
    const {
        projectDetails
    } = useProject();

    // Collapsed state
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const closeMobile = React.useCallback(() => onMobileClose?.(), [onMobileClose]);
    const handleTabChange = React.useCallback((id: TabId) => {
        onTabChange(id);
        closeMobile();
    }, [closeMobile, onTabChange]);
    const isCompact = isCollapsed && !isMobileOpen;

    const mainGroup = React.useMemo<MenuItem[]>(() => [
        { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    ], [t]);

    const engineeringGroup = React.useMemo<MenuItem[]>(() => [
        { id: 'wizard', label: 'Asistent Dimensionare', icon: Wand2, badge: 'NOU' },
        { id: 'config', label: 'Dimensionare Conducte', icon: Package },
        { id: 'hydraulics', label: t('sidebar.hydraulics'), icon: Wrench },
        { id: 'supports', label: t('sidebar.supports'), icon: Anchor },
        { id: 'weights', label: t('sidebar.loadCalc'), icon: Scale },
    ], [t]);

    const databaseGroup = React.useMemo<MenuItem[]>(() => [
        { id: 'pipe-standards', label: 'Standarde Țevi', icon: Ruler },
        { id: 'bim_gallery', label: t('sidebar.bimGallery'), icon: Cuboid },
        { id: 'architecture_spec', label: t('sidebar.architectureSpec') !== 'sidebar.architectureSpec' ? t('sidebar.architectureSpec') : 'Asistent Specificații', icon: Sparkles },
        { id: 'normative', label: t('sidebar.normativeSearch') !== 'sidebar.normativeSearch' ? t('sidebar.normativeSearch') : 'Normative', icon: FileText },
    ], [t]);

    const reportsGroup = React.useMemo<MenuItem[]>(() => [
        { id: 'photos', label: t('sidebar.sitePhotos'), icon: Camera },
        { id: 'branding', label: t('sidebar.reportBranding'), icon: Palette },
        { id: 'settings', label: t('common.settings'), icon: Settings },
    ], [t]);

    return (
        <>
            {isMobileOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
                    onClick={closeMobile}
                    aria-label="Închide meniul de navigare"
                />
            )}
            <aside
                className={`sidebar-panel fixed inset-y-0 left-0 flex w-[min(88vw,280px)] flex-col justify-between p-3 z-50 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 lg:transition-[width]
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-[280px]'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            role="navigation"
                aria-label="Navigare principală"
            >
            {/* Collapse Toggle */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 z-50 hidden rounded-full border border-border bg-card p-1 text-muted-foreground shadow-sm transition-colors hover:scale-110 hover:text-foreground active:scale-95 lg:block"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isCollapsed}
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <button
                type="button"
                onClick={closeMobile}
                className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Închide meniul"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
                {/* Brand Logo */}
                <div className={`flex items-center gap-3 px-2 mb-6 pt-2 transition-all ${isCompact ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Box className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
                    </div>
                    {!isCompact && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <h1 className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">{t('sidebar.brand')}</h1>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                {t('common.systemActive')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Project Selector */}
                <button
                    onClick={() => {
                        closeMobile();
                        onSettingsOpen();
                    }}
                    type="button"
                    className={`w-full group flex items-center p-2 rounded-xl border border-transparent hover:border-border/70 hover:bg-muted/70 transition-all mb-5
                        ${isCompact ? 'justify-center' : 'justify-between'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs shrink-0">
                            {projectDetails.projectNumber?.slice(0, 2) || 'PR'}
                        </div>
                        {!isCompact && (
                            <div className="flex flex-col min-w-0 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors text-foreground max-w-[140px]">
                                    {projectDetails.projectName || t('common.project')}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                    {projectDetails.projectNumber || '—'}
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCompact && (
                        <Settings className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                    )}
                </button>

                {/* Navigation Sections */}
                <nav className="space-y-5" aria-label="Secțiuni aplicație">
                    <NavSection items={mainGroup} activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCompact} />

                    <div className="relative">
                        {!isCompact && <div className="px-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 font-mono">{t('sidebar.engineering')}</div>}
                        {isCompact && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={engineeringGroup} activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCompact} />
                    </div>

                    <div className="relative">
                        {!isCompact && <div className="px-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 font-mono">{t('sidebar.resources')}</div>}
                        {isCompact && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={databaseGroup} activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCompact} />
                    </div>

                    <div className="relative">
                        {!isCompact && <div className="px-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 font-mono">{t('sidebar.output')}</div>}
                        {isCompact && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={reportsGroup} activeTab={activeTab} onTabChange={handleTabChange} isCollapsed={isCompact} />
                    </div>
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className={`mt-4 pt-4 border-t border-border/60 space-y-3 ${isCompact ? 'flex flex-col items-center' : ''}`} >
                {!isCompact ? (
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={onExportOpen} className="col-span-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground h-9 rounded-full text-xs font-medium transition-colors hover:bg-primary/90">
                            <Printer className="w-3.5 h-3.5" />
                            {t('common.export')}
                        </button>

                        <button onClick={onSave} className="flex items-center justify-center h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors" title={t('common.save')}>
                            <Save className="w-3.5 h-3.5" />
                        </button>

                        <label className="flex items-center justify-center h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title={t('common.import')}>
                            <Upload className="w-3.5 h-3.5" />
                            <input type="file" accept=".json" onChange={onLoad} className="hidden" />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <Tooltip content={t('common.export')} side="right">
                            <button onClick={onExportOpen} className="w-full flex items-center justify-center bg-primary text-primary-foreground h-9 rounded-full hover:bg-primary/90 transition-colors">
                                <Printer className="w-4 h-4" />
                            </button>
                        </Tooltip>
                        <Tooltip content={t('common.save')} side="right">
                            <button onClick={onSave} className="w-full flex items-center justify-center h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <Save className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                <div className={`flex items-center gap-2 ${isCompact ? 'flex-col justify-center w-full' : 'justify-between'}`}>
                    <ThemeToggle />
                    {!isCompact && <OnlineStatusBadge />}

                    {isCompact ? (
                        <Tooltip content={t('common.help')} side="right">
                            <button
                                onClick={() => handleTabChange('help')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
                            >
                                <HelpCircle className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    ) : (
                        <button
                            onClick={() => handleTabChange('help')}
                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {t('common.help')}
                        </button>
                    )}
                </div>

                {!isCompact && (
                    <div className="text-[9px] text-center text-muted-foreground/20 font-mono mt-2 uppercase tracking-widest animate-in fade-in">
                        Datacenter OS v2026.1
                    </div>
                )}
            </div >
            </aside >
        </>
    );
};

export const Sidebar = React.memo(SidebarBase);
