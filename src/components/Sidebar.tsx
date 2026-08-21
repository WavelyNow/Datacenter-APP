"use client";

import React from 'react';
import {
    Box,
    LayoutDashboard,
    Book,
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
    Leaf,
    Calculator,
    ClipboardCheck,
    Wrench,
    Cuboid,
    Layers,
    LucideIcon,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    Building2,
    FileText,
    Sparkles,
    Ruler
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
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <div className={`relative flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            {item.badge && isCollapsed && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-background" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <>
                                <span className={`text-xs font-medium truncate ${isActive ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                                {item.badge && (
                                    <span className="ml-auto text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}

                        {/* Active Indicator (Left Border) */}
                        {isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-foreground/20 rounded-r-full" />
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
}

const SidebarBase: React.FC<SidebarProps> = ({
    onSettingsOpen,
    onExportOpen,
    onSave,
    onLoad
}) => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab: onTabChange } = useUI();
    const {
        projectDetails
    } = useProject();

    // Collapsed state
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const mainGroup = React.useMemo<MenuItem[]>(() => [
        { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    ], [t]);

    const engineeringGroup = React.useMemo<MenuItem[]>(() => [
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
        <aside
            className={`sidebar-panel flex flex-col justify-between p-3 z-50 transition-all duration-300 ease-in-out relative
                ${isCollapsed ? 'w-20' : 'w-[280px]'}
            `}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-card border border-border shadow-sm rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors z-50 hover:scale-110 active:scale-95"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isCollapsed}
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
                {/* Brand Logo */}
                <div className={`flex items-center gap-3 px-2 mb-8 pt-2 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10 group cursor-default shrink-0">
                        <Box className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <h1 className="text-sm font-bold tracking-tight text-foreground/90 whitespace-nowrap">{t('sidebar.brand')}</h1>
                            <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                {t('common.systemActive')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Project Selector */}
                <button
                    onClick={onSettingsOpen}
                    className={`w-full group flex items-center p-2.5 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 transition-all mb-6 backdrop-blur-sm
                        ${isCollapsed ? 'justify-center' : 'justify-between'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-gray-800 to-black flex items-center justify-center text-gray-300 font-bold text-xs shrink-0 border border-white/5 shadow-inner">
                            {projectDetails.projectNumber?.slice(0, 2) || 'PR'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors text-foreground max-w-[140px]">
                                    {projectDetails.projectName || t('common.project')}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                    PROJ-{projectDetails.projectNumber || '000'}
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <Settings className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                    )}
                </button>

                {/* Navigation Sections */}
                <nav className="space-y-6">
                    <NavSection items={mainGroup} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={isCollapsed} />

                    <div className="relative">
                        {!isCollapsed && <div className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2 font-mono">{t('sidebar.engineering')}</div>}
                        {isCollapsed && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={engineeringGroup} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={isCollapsed} />
                    </div>

                    <div className="relative">
                        {!isCollapsed && <div className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2 font-mono">{t('sidebar.resources')}</div>}
                        {isCollapsed && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={databaseGroup} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={isCollapsed} />
                    </div>

                    <div className="relative">
                        {!isCollapsed && <div className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2 font-mono">{t('sidebar.output')}</div>}
                        {isCollapsed && <div className="h-px bg-border/40 mx-4 mb-4" />}
                        <NavSection items={reportsGroup} activeTab={activeTab} onTabChange={onTabChange} isCollapsed={isCollapsed} />
                    </div>
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className={`mt-4 pt-4 border-t border-border/50 space-y-3 ${isCollapsed ? 'flex flex-col items-center' : ''}`} >
                {!isCollapsed ? (
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={onExportOpen} className="col-span-2 flex items-center justify-center gap-2 bg-foreground text-background h-9 rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            <Printer className="w-3.5 h-3.5" />
                            {t('common.export')}
                        </button>

                        <button onClick={onSave} className="flex items-center justify-center h-9 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/60 transition-all" title={t('common.save')}>
                            <Save className="w-3.5 h-3.5" />
                        </button>

                        <label className="flex items-center justify-center h-9 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/60 transition-all cursor-pointer" title={t('common.import')}>
                            <Upload className="w-3.5 h-3.5" />
                            <input type="file" accept=".json" onChange={onLoad} className="hidden" />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <Tooltip content={t('common.export')} side="right">
                            <button onClick={onExportOpen} className="w-full flex items-center justify-center bg-foreground text-background h-9 rounded-xl shadow-lg hover:brightness-110 transition-all">
                                <Printer className="w-4 h-4" />
                            </button>
                        </Tooltip>
                        <Tooltip content={t('common.save')} side="right">
                            <button onClick={onSave} className="w-full flex items-center justify-center h-9 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                                <Save className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col justify-center w-full' : 'justify-between'}`}>
                    <ThemeToggle />
                    {!isCollapsed && <OnlineStatusBadge />}

                    {isCollapsed ? (
                        <Tooltip content={t('common.help')} side="right">
                            <button
                                onClick={() => onTabChange('help')}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
                            >
                                <HelpCircle className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    ) : (
                        <button
                            onClick={() => onTabChange('help')}
                            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {t('common.help')}
                        </button>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="text-[9px] text-center text-muted-foreground/20 font-mono mt-2 uppercase tracking-widest animate-in fade-in">
                        Datacenter OS v2026.1
                    </div>
                )}
            </div >
        </aside >
    );
};

export const Sidebar = React.memo(SidebarBase);
