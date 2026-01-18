"use client";

import React from 'react';
import { ProjectDetails } from '@/lib/types';
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
    Cuboid
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
// import { useHelp } from './help/HelpContext'; // Assuming this exists or kept if needed

export type TabId = 'dashboard' | 'config' | 'supports' | 'weights' | 'photos' | 'branding' | 'catalogs' | 'bim' | 'bim_gallery' | 'energy' | 'costs' | 'checklist' | 'hydraulics' | 'help';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
    projectDetails: ProjectDetails;
    onSettingsOpen: () => void;
    onExportOpen: () => void;
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    onTabChange,
    projectDetails,
    onSettingsOpen,
    onExportOpen,
    onSave,
    onLoad
}) => {
    // Navigation Groups
    interface MenuItem {
        id: TabId;
        label: string;
        icon: React.ElementType<any>;
        badge?: string;
    }

    const mainGroup: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    const engineeringGroup: MenuItem[] = [
        { id: 'bim', label: 'BIM Analysis', icon: Box },
        { id: 'bim_gallery', label: '3D Gallery', icon: Cuboid, badge: 'PRO' },
        { id: 'config', label: 'Piping & Routing', icon: Package },
        { id: 'hydraulics', label: 'Hydraulics', icon: Wrench },
        { id: 'energy', label: 'Energy Efficiency', icon: Leaf },
        { id: 'supports', label: 'Supports', icon: Anchor },
        { id: 'weights', label: 'Load Calc', icon: Scale },
        { id: 'costs', label: 'Cost Estimation', icon: Calculator },
        { id: 'checklist', label: 'Commissioning', icon: ClipboardCheck },
    ];

    const databaseGroup: MenuItem[] = [
        { id: 'catalogs', label: 'Tech Library', icon: Book },
    ];

    const reportsGroup: MenuItem[] = [
        { id: 'photos', label: 'Site Photos', icon: Camera },
        { id: 'branding', label: 'Report Branding', icon: Palette },
    ];

    // Helper for rendering a section
    const NavSection = ({ title, items }: { title?: string, items: MenuItem[] }) => (
        <div className="mb-6">
            {title && (
                <p className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2 font-mono">
                    {title}
                </p>
            )}
            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon as any;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'text-primary-foreground font-semibold shadow-lg shadow-primary/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-100 z-0" />
                            )}

                            <Icon className={`w-4 h-4 z-10 transition-colors ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                            <span className="z-10 tracking-wide relative">
                                {item.label}
                            </span>

                            {item.badge && (
                                <span className={`z-10 ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold border ${isActive
                                    ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20'
                                    : 'bg-primary/10 text-primary border-primary/20'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside className="sidebar-panel w-[280px] flex flex-col justify-between p-4 z-50">
            {/* Header Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">

                {/* Brand Logo */}
                <div className="flex items-center gap-3 px-2 mb-10 pt-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10 group cursor-default">
                        <Box className="w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight text-foreground/90">Engineering Suite</h1>
                        <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            SYSTEM V3.0
                        </p>
                    </div>
                </div>

                {/* Project Selector */}
                <button
                    onClick={onSettingsOpen}
                    className="w-full group flex items-center justify-between p-3 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-white/5 hover:border-white/10 transition-all mb-8 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-300 font-bold text-xs shrink-0 border border-white/5">
                            {projectDetails.projectNumber?.slice(0, 2) || 'PR'}
                        </div>
                        <div className="flex flex-col min-w-0 items-start">
                            <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors text-foreground">
                                {projectDetails.projectName || 'Untitled Project'}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate">
                                PROJ-{projectDetails.projectNumber || '000'}
                            </span>
                        </div>
                    </div>
                    <Settings className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>

                {/* Navigation Sections */}
                <nav className="-mx-2">
                    <NavSection items={mainGroup} />
                    <NavSection title="Engineering" items={engineeringGroup} />
                    <NavSection title="Resources" items={databaseGroup} />
                    <NavSection title="Output" items={reportsGroup} />
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">

                {/* Action Grid */}
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={onExportOpen} className="col-span-2 flex items-center justify-center gap-2 bg-foreground text-background h-9 rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        <Printer className="w-3.5 h-3.5" />
                        Export
                    </button>

                    <button onClick={onSave} className="flex items-center justify-center h-9 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-white/10 transition-all" title="Save JSON">
                        <Save className="w-3.5 h-3.5" />
                    </button>

                    <label className="flex items-center justify-center h-9 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-white/10 transition-all cursor-pointer" title="Load JSON">
                        <Upload className="w-3.5 h-3.5" />
                        <input type="file" accept=".json" onChange={onLoad} className="hidden" />
                    </label>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => onTabChange('help')}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Help
                    </button>
                </div>

                <div className="text-[9px] text-center text-muted-foreground/20 font-mono mt-2">
                    Datacenter OS v2026.1
                </div>
            </div>
        </aside>
    );
};
